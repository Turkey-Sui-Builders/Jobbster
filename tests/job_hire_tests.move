#[test_only]
module job_hire::job_hire_tests;

use job_hire::job_hire::{Self, JobBoard, Job, Version, EmployerCap, WorkProof};
use std::option;
use sui::clock::{Self, Clock};
use sui::object::{Self, ID};
use sui::test_scenario::{Self as ts, Scenario};

// 2. Oyuncular (Adresler)
const ADMIN: address = @0xA;
const PATRON: address = @0xB;
const ADAY_1: address = @0xC;
const ADAY_2: address = @0xD;
const HACKER: address = @0xE;

// 3. Sabitler
const JOB_DEADLINE: u64 = 100000; // Ms cinsinden

// --- YARDIMCI FONKSİYON: DÜNYAYI KUR ---
fun setup_test(): Scenario {
    let mut scenario = ts::begin(ADMIN);
    {
        let ctx = ts::ctx(&mut scenario);
        job_hire::init_for_testing(ctx);
    };
    scenario
}

// ==========================================
// ✅ TEST 1: MUTLU YOL (Full Happy Path)
// İlan Aç -> Başvur (Walrus verileriyle) -> İşe Al -> NFT Kontrolü
// ==========================================
#[test]
fun test_full_hiring_flow() {
    let mut scenario = setup_test();
    let clock = clock::create_for_testing(ts::ctx(&mut scenario));

    // ADIM A: Patron İlan Açar
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut board = ts::take_shared<JobBoard>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        job_hire::create_job(
            &mut board,
            &version,
            b"Google",
            b"Remote",
            b"Tech",
            b"Backend",
            b"Desc",
            option::some(5000),
            JOB_DEADLINE,
            ctx,
        );
        ts::return_shared(board);
        ts::return_shared(version);
    };

    // ADIM B: Aday Başvurur (Walrus verileriyle)
    ts::next_tx(&mut scenario, ADAY_1);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        job_hire::apply(
            &mut job,
            b"Ahmet", // Aday İsmi
            &version,
            &clock,
            b"blob_id_123", // Walrus Blob ID (Dummy)
            b"encrypted_key", // Seal Encrypted Key (Dummy)
            b"cover_letter", // Cover Letter
            ctx,
        );
        ts::return_shared(job);
        ts::return_shared(version);
    };

    // ADIM C: Patron İşe Alır
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        let cap = ts::take_from_sender<EmployerCap>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        job_hire::hire(
            &mut job,
            &clock,
            b"Google", // NFT Şirket Adı
            b"Backend", // NFT Unvan
            &cap,
            ADAY_1,
            &version,
            ctx,
        );

        ts::return_to_sender(&scenario, cap);
        ts::return_shared(job);
        ts::return_shared(version);
    };

    // ADIM D: Kritik Kontrol - NFT Adaya Gitti mi?
    ts::next_tx(&mut scenario, ADAY_1);
    {
        // 'take_from_sender' kullanıyoruz çünkü NFT adayın cüzdanına yollandı (Son koduna göre).
        let proof = ts::take_from_sender<WorkProof>(&scenario);

        // Test başarılıysa iade et
        ts::return_to_sender(&scenario, proof);
    };

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

// ==========================================
// 🔄 TEST 2: BAŞVURU İPTALİ VE TEKRAR (Cancel & Re-Apply)
// Başvur -> İptal Et -> Tekrar Başvur (Hata vermemeli)
// ==========================================
#[test]
fun test_cancel_and_reapply() {
    let mut scenario = setup_test();
    let clock = clock::create_for_testing(ts::ctx(&mut scenario));

    // 1. İlan Aç
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut board = ts::take_shared<JobBoard>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::create_job(
            &mut board,
            &version,
            b"X",
            b"X",
            b"X",
            b"X",
            b"X",
            option::none(),
            JOB_DEADLINE,
            ts::ctx(&mut scenario),
        );
        ts::return_shared(board);
        ts::return_shared(version);
    };

    // 2. Aday Başvurur
    ts::next_tx(&mut scenario, ADAY_1);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::apply(
            &mut job,
            b"Aday",
            &version,
            &clock,
            b"blob",
            b"key",
            b"ltr",
            ts::ctx(&mut scenario),
        );
        ts::return_shared(job);
        ts::return_shared(version);
    };

    // 3. Aday İptal Eder
    ts::next_tx(&mut scenario, ADAY_1);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);

        // İptal Fonksiyonu Testi
        job_hire::cancel_application(&mut job, &version, &clock, ts::ctx(&mut scenario));

        ts::return_shared(job);
        ts::return_shared(version);
    };

    // 4. Aday Tekrar Başvurur (Hata vermemeli)
    ts::next_tx(&mut scenario, ADAY_1);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);

        // Eğer silme başarısız olsaydı burası EAlreadyApplied verirdi
        job_hire::apply(
            &mut job,
            b"Aday V2",
            &version,
            &clock,
            b"blob2",
            b"key2",
            b"ltr2",
            ts::ctx(&mut scenario),
        );

        ts::return_shared(job);
        ts::return_shared(version);
    };

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

// ==========================================
// ⏰ TEST 3: SÜRESİ GEÇMİŞ İLAN (Deadline)
// Süre dolduktan sonra başvuru yapılamamalı.
// ==========================================
#[test]
#[expected_failure(abort_code = job_hire::EDeadlinePassed)]
fun test_deadline_passed() {
    let mut scenario = setup_test();
    let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));

    // 1. İlan Aç
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut board = ts::take_shared<JobBoard>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::create_job(
            &mut board,
            &version,
            b"X",
            b"X",
            b"X",
            b"X",
            b"X",
            option::none(),
            JOB_DEADLINE,
            ts::ctx(&mut scenario),
        );
        ts::return_shared(board);
        ts::return_shared(version);
    };

    // 2. Zamanı İleri Sar (Time Travel)
    clock::set_for_testing(&mut clock, JOB_DEADLINE + 1);

    // 3. Başvurmaya Çalış (Hata Vermeli)
    ts::next_tx(&mut scenario, ADAY_1);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);

        job_hire::apply(
            &mut job,
            b"Aday",
            &version,
            &clock,
            b"blob",
            b"key",
            b"ltr",
            ts::ctx(&mut scenario),
        );

        ts::return_shared(job);
        ts::return_shared(version);
    };

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

// ==========================================
// 🚫 TEST 4: ÇİFT BAŞVURU (Double Apply)
// Aynı kişi aynı ilana iki kere başvuramaz.
// ==========================================
#[test]
#[expected_failure(abort_code = job_hire::EAlreadyApplied)]
fun test_double_application() {
    let mut scenario = setup_test();
    let clock = clock::create_for_testing(ts::ctx(&mut scenario));

    // 1. İlan Aç
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut board = ts::take_shared<JobBoard>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::create_job(
            &mut board,
            &version,
            b"X",
            b"X",
            b"X",
            b"X",
            b"X",
            option::none(),
            JOB_DEADLINE,
            ts::ctx(&mut scenario),
        );
        ts::return_shared(board);
        ts::return_shared(version);
    };

    // 2. İlk Başvuru (Başarılı)
    ts::next_tx(&mut scenario, ADAY_1);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::apply(
            &mut job,
            b"Aday",
            &version,
            &clock,
            b"blob",
            b"key",
            b"ltr",
            ts::ctx(&mut scenario),
        );
        ts::return_shared(job);
        ts::return_shared(version);
    };

    // 3. İkinci Başvuru (Hata Vermeli)
    ts::next_tx(&mut scenario, ADAY_1);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);

        job_hire::apply(
            &mut job,
            b"Aday",
            &version,
            &clock,
            b"blob",
            b"key",
            b"ltr",
            ts::ctx(&mut scenario),
        );

        ts::return_shared(job);
        ts::return_shared(version);
    };

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

// ==========================================
// 🏴‍☠️ TEST 5: YETKİSİZ HIRE (Unauthorized)
// Hacker, Patronun ilanını kapatmaya çalışıyor.
// ==========================================
#[test]
#[expected_failure(abort_code = job_hire::ENotAuthorized)]
fun test_hacker_cannot_hire() {
    let mut scenario = setup_test();
    let clock = clock::create_for_testing(ts::ctx(&mut scenario));
    let target_job_id: ID;

    // 1. Patron İlan Açar
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut board = ts::take_shared<JobBoard>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::create_job(
            &mut board,
            &version,
            b"Target",
            b"",
            b"",
            b"",
            b"",
            option::none(),
            JOB_DEADLINE,
            ts::ctx(&mut scenario),
        );
        ts::return_shared(board);
        ts::return_shared(version);
    };

    // ID'yi Kaydet
    ts::next_tx(&mut scenario, PATRON);
    {
        let job = ts::take_shared<Job>(&scenario);
        target_job_id = object::id(&job);
        ts::return_shared(job);
    };

    // 2. Hacker Kendi İlanını Açar (Kendi Cap'ini almak için)
    ts::next_tx(&mut scenario, HACKER);
    {
        let mut board = ts::take_shared<JobBoard>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::create_job(
            &mut board,
            &version,
            b"Fake",
            b"",
            b"",
            b"",
            b"",
            option::none(),
            JOB_DEADLINE,
            ts::ctx(&mut scenario),
        );
        ts::return_shared(board);
        ts::return_shared(version);
    };

    // 3. SALDIRI: Hacker, Patronun ilanını kendi Cap'iyle kapatmaya çalışır
    ts::next_tx(&mut scenario, HACKER);
    {
        let mut target_job = ts::take_shared_by_id<Job>(&scenario, target_job_id);
        let version = ts::take_shared<Version>(&scenario);
        let wrong_cap = ts::take_from_sender<EmployerCap>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        job_hire::hire(
            &mut target_job,
            &clock,
            b"Hacked",
            b"Hacked",
            &wrong_cap,
            HACKER,
            &version,
            ctx,
        );

        ts::return_to_sender(&scenario, wrong_cap);
        ts::return_shared(target_job);
        ts::return_shared(version);
    };

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

// ==========================================
// 🚫 TEST 6: OLMAYAN BAŞVURUYU İPTAL ETME
// ==========================================
#[test]
#[expected_failure(abort_code = job_hire::ENotAuthorized)]
fun test_cancel_without_applying() {
    let mut scenario = setup_test();
    let clock = clock::create_for_testing(ts::ctx(&mut scenario));

    // 1. İlan Aç
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut board = ts::take_shared<JobBoard>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::create_job(
            &mut board,
            &version,
            b"X",
            b"X",
            b"X",
            b"X",
            b"X",
            option::none(),
            JOB_DEADLINE,
            ts::ctx(&mut scenario),
        );
        ts::return_shared(board);
        ts::return_shared(version);
    };

    // 2. Aday Başvurmadan İptal Etmeye Çalışır
    ts::next_tx(&mut scenario, ADAY_1);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);

        job_hire::cancel_application(&mut job, &version, &clock, ts::ctx(&mut scenario));

        ts::return_shared(job);
        ts::return_shared(version);
    };

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

// ==========================================
// ❌ TEST 7: REDDEDİLEN ADAYIN İŞE ALINAMAMASI (Deny Logic)
// ==========================================
#[test]
#[expected_failure(abort_code = job_hire::EApplicationDenied)]
fun test_deny_and_fail_hire() {
    let mut scenario = setup_test();
    let clock = clock::create_for_testing(ts::ctx(&mut scenario));

    // 1. İlan Aç
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut board = ts::take_shared<JobBoard>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::create_job(
            &mut board,
            &version,
            b"X",
            b"X",
            b"X",
            b"X",
            b"X",
            option::none(),
            JOB_DEADLINE,
            ts::ctx(&mut scenario),
        );
        ts::return_shared(board);
        ts::return_shared(version);
    };

    // 2. Aday Başvurur
    ts::next_tx(&mut scenario, ADAY_1);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        job_hire::apply(
            &mut job,
            b"Reddedilecek Adam",
            &version,
            &clock,
            b"blob",
            b"key",
            b"ltr",
            ts::ctx(&mut scenario),
        );
        ts::return_shared(job);
        ts::return_shared(version);
    };

    // 3. Patron Başvuruyu Reddeder (DENY)
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        let cap = ts::take_from_sender<EmployerCap>(&scenario);

        job_hire::deny_application(
            &mut job,
            &cap,
            ADAY_1,
            &version,
            ts::ctx(&mut scenario),
        );

        ts::return_to_sender(&scenario, cap);
        ts::return_shared(job);
        ts::return_shared(version);
    };

    // 4. Patron Yanlışlıkla İşe Almaya Çalışır (HATA VERMELİ)
    ts::next_tx(&mut scenario, PATRON);
    {
        let mut job = ts::take_shared<Job>(&scenario);
        let version = ts::take_shared<Version>(&scenario);
        let cap = ts::take_from_sender<EmployerCap>(&scenario);
        let ctx = ts::ctx(&mut scenario);

        // EApplicationDenied hatası beklenir
        job_hire::hire(
            &mut job,
            &clock,
            b"X",
            b"X",
            &cap,
            ADAY_1,
            &version,
            ctx,
        );

        ts::return_to_sender(&scenario, cap);
        ts::return_shared(job);
        ts::return_shared(version);
    };

    clock::destroy_for_testing(clock);
    ts::end(scenario);
}
