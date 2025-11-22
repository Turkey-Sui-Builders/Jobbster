/// Module: job_hire
module job_hire::job_hire;

use std::string;
use sui::clock::{Self, Clock};
use sui::dynamic_object_field as dof;

public struct Version has key {
    id: UID,
    version: u64,
}

// ERROR CODES
const EInvalidPublisher: u64 = 0;
const EInvalidPackageVersion: u64 = 1;
const EAlreadyApplied: u64 = 2;
const ENotAuthorized: u64 = 3;
const EDeadlinePassed: u64 = 4; // Hata kodu
const EApplicationDenied: u64 = 5; // Hata kodu

// VERSION
const VERSION: u64 = 1;

// --- EVENTS  ---

public struct JobCreated has copy, drop {
    job_id: ID,
    employer: address,
    company: string::String,
    title: string::String,
    deadline: u64,
}
public struct ApplicationSubmitted has copy, drop {
    job_id: ID,
    applicant: address,
    applicant_name: string::String,
    timestamp: u64,
}

public struct CandidateHired has copy, drop {
    job_id: ID,
    employer: address,
    candidate: address,
    hired_at: u64,
}

// Eventler kısmına ekle:
public struct ApplicationCancelled has copy, drop {
    job_id: ID,
    applicant: address,
    timestamp: u64,
}

// STRUCTS

// --- WORK PROOF (NFT) ---
// 'store' yok, satılamaz.
public struct WorkProof has key, store {
    id: UID,
    job_id: ID,
    company: string::String,
    title: string::String,
    date_hired: u64,
    recipient: address,
}

public struct JOB_HIRE has drop {}

public struct JobBoard has key {
    id: UID,
    jobs: vector<ID>,
}

public struct Job has key, store {
    id: UID,
    company: string::String, // şirket adı
    location: string::String, // işin lokasyonu
    employer: address, // işe alan kişinin adresi ileride cap vericem // bu adresi ctx.sender() ile alıcam
    category: string::String, //işin kategorisi
    name: string::String, //iş ilanının adı
    description: string::String, //iş ilanının açıklaması
    salary: option::Option<u64>, //maaş bilgisi
    // applicants: vector<address>, // başvuran kişilerin adresleri burayı dynamic yapcam
    deadline: u64, // timestamp olarak son başvuru tarihi
    applicants_count: u64, // başvuran kişi sayısı
    hired_applicant: option::Option<address>, // işe alınan kişinin adresi
}

public struct Application has key, store {
    id: UID,
    job_id: ID,
    applicant_name: string::String, // başvuran kişinin adı
    applicant: address, // başvuran kişinin adresi
    // WALRUS & SEAL VERİLERİ
    walrus_blob_id: string::String, // Şifreli PDF'in Walrus adresi
    encrypted_symmetric_key: vector<u8>, // Seal ile şifrelenmiş AES anahtarı
    //resume_link: string::String, // özgeçmiş linki
    cover_letter: string::String, // ön yazı
    is_denied: bool, // başvurunun reddedilip reddedilmediği
    // yukardaki gibi başvuru ya da deadline tarihi almadım ctx kısmından alıcam
}

public struct EmployerCap has key, store {
    id: UID,
    job_id: ID, // Hangi ilanın patronu olduğunu belirtir
}

// FUNCTIONS

fun init(otw: JOB_HIRE, ctx: &mut TxContext) {
    // 1. Publisher'ı al (Display ve Upgrade için şart)
    let publisher = sui::package::claim(otw, ctx);

    // --- DISPLAY FOR WORKPROOF ---
    let keys = vector[
        b"name".to_string(),
        b"link".to_string(),
        b"image_url".to_string(),
        b"description".to_string(),
        b"project_url".to_string(),
        b"creator".to_string(),
        // Yeni alanları display'e ekleyebilirsin
    ];

    let values = vector[
        b"Badge: {title} at {company}".to_string(),
        b"https://jobbster.app/badge/{id}".to_string(),
        b"https://ajanspr.com.tr/wp-content/uploads/2023/08/gold-tik-altin-tik-blue-tick-mavi-tick-instagram.jpg".to_string(),
        b"Employment Proof.".to_string(),
        b"https://jobbster.app".to_string(),
        b"Jobbster".to_string(),
    ];

    let mut display = sui::display::new_with_fields<WorkProof>(
        &publisher,
        keys,
        values,
        ctx,
    );
    sui::display::update_version(&mut display);
    transfer::public_transfer(display, tx_context::sender(ctx));

    // -----------------------------

    // 2. Versiyon objesini paylaş
    transfer::share_object(Version {
        id: object::new(ctx),
        version: VERSION,
    });

    // 3. JobBoard'ı (Panoyu) oluştur ve paylaş! (Bunu unutmuştun)
    transfer::share_object(JobBoard {
        id: object::new(ctx),
        jobs: vector::empty(),
    });

    // 4. Publisher yetkisini deploy eden kişiye ver
    transfer::public_transfer(publisher, tx_context::sender(ctx));
}

//                                      ADMIN ONLY                                      //

public fun migrate(publisher: &sui::package::Publisher, version: &mut Version) {
    // Düzeltme: from_package<JOB_HIRE> olmalı, Version değil.
    assert!(publisher.from_package<JOB_HIRE>(), EInvalidPublisher);
    version.version = VERSION;
}

public fun check_is_valid(self: &Version) {
    assert!(self.version == VERSION, EInvalidPackageVersion);
}

//                              PUBLIC FUNCTIONS                             //
public fun create_job(
    job_board: &mut JobBoard,
    version: &Version, // Güvenlik kontrolü için bunu da istemelisin
    company: vector<u8>,
    location: vector<u8>,
    category: vector<u8>, // String yerine vector<u8>
    name: vector<u8>,
    description: vector<u8>,
    salary: option::Option<u64>,
    deadline: u64,
    ctx: &mut TxContext,
) {
    check_is_valid(version);

    let sender = tx_context::sender(ctx);

    let job_uid = object::new(ctx);
    let job_id = object::uid_to_inner(&job_uid);
    let company_name = string::utf8(company);
    let title_str = string::utf8(name);
    let job = Job {
        id: job_uid,
        employer: sender,
        company: company_name,
        location: string::utf8(location),
        category: string::utf8(category), // Byte -> String dönüşümü
        name: title_str,
        description: string::utf8(description),
        salary: salary,
        deadline: deadline,
        hired_applicant: option::none(),
        applicants_count: 0,
    };

    let employer_cap = EmployerCap {
        id: object::new(ctx),
        job_id: job_id,
    };

    // a) Job objesini PAYLAŞ (Shared Object)
    transfer::share_object(job);

    // b) Yetkiyi patrona GÖNDER (Owned Object)
    transfer::public_transfer(employer_cap, sender);

    // c) Panoya kaydet
    job_board.jobs.push_back(job_id);

    sui::event::emit(JobCreated {
        job_id: job_id,
        employer: sender,
        company: company_name,
        title: title_str,
        deadline: deadline,
    });
}

public fun apply(
    job: &mut Job,
    applicant_name: vector<u8>,
    version: &Version,
    clock: &Clock,
    //resume_link: vector<u8>,
    walrus_blob_id: vector<u8>,
    encrypted_symmetric_key: vector<u8>,
    cover_letter: vector<u8>,
    ctx: &mut TxContext,
) {
    check_is_valid(version);
    let applicant = tx_context::sender(ctx);
    let applicant_name = string::utf8(applicant_name);
    // KONTROL: Bu kişi daha önce başvurmuş mu?
    // Dynamic Field içinde bu adres anahtar olarak var mı diye bakıyoruz.
    assert!(clock.timestamp_ms() <= job.deadline, EDeadlinePassed);
    assert!(!dof::exists_(&job.id, applicant), EAlreadyApplied);

    // Application objesini oluştur
    let application = Application {
        id: object::new(ctx),
        job_id: object::id(job),
        applicant_name: applicant_name,
        applicant: applicant,
        walrus_blob_id: string::utf8(walrus_blob_id),
        encrypted_symmetric_key: encrypted_symmetric_key,
        is_denied: false,
        //resume_link: string::utf8(resume_link),
        cover_letter: string::utf8(cover_letter),
    };

    // DYNAMIC FIELD EKLEME
    // job.id -> Ana obje (Parent)
    // applicant -> Anahtar (Key - Adres benzersizdir)
    // application -> Değer (Value - Eklenecek obje)
    dof::add(&mut job.id, applicant, application);

    // Sayacı artır (Frontend için önemli)
    job.applicants_count = job.applicants_count + 1;

    sui::event::emit(ApplicationSubmitted {
        job_id: object::id(job),
        applicant_name: applicant_name,
        applicant: applicant,
        timestamp: clock.timestamp_ms(),
    });
}

public fun cancel_application(
    job: &mut Job,
    version: &Version,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    check_is_valid(version);
    let applicant = tx_context::sender(ctx);

    // 1. Kontrol: Başvurusu var mı?
    // dof::exists_ fonksiyonu true/false döner.
    // Eğer başvuru yoksa ENotAuthorized hatası verebiliriz veya özel bir hata tanımlayabiliriz.
    // (Not: dof::remove zaten yoksa panic verir ama assert daha temizdir)
    assert!(dof::exists_(&job.id, applicant), ENotAuthorized);

    // 2. Dynamic Field'dan Söküp Al (Remove)
    // Key: applicant (address), Value: Application
    let application_obj = dof::remove<address, Application>(&mut job.id, applicant);

    // 3. Objeyi Parçala ve Sil (Unpack and Delete)
    // Move'da bir struct'ı yok etmek için içindeki her şeyi çıkarman gerekir.
    let Application {
        id,
        job_id: _, // _ ile kullanmayacağımız verileri yoksayıyoruz
        applicant_name: _,
        applicant: _,
        //resume_link: _,
        walrus_blob_id: _,
        encrypted_symmetric_key: _,
        cover_letter: _,
        is_denied: _,
    } = application_obj;

    // UID'yi silmek, objeyi zincirden tamamen siler.
    object::delete(id);

    // 4. Sayacı Azalt
    job.applicants_count = job.applicants_count - 1;

    // 5. Event Fırlat
    sui::event::emit(ApplicationCancelled {
        job_id: object::id(job),
        applicant: applicant,
        timestamp: clock.timestamp_ms(),
    });
}

public fun deny_application(
    job: &mut Job,
    employer_cap: &EmployerCap,
    applicant: address,
    version: &Version,
    ctx: &mut TxContext,
) {
    check_is_valid(version);
    assert!(employer_cap.job_id == object::id(job), ENotAuthorized);
    // 1. Kontrol: Başvurusu var mı?
    assert!(dof::exists_(&job.id, applicant), ENotAuthorized);

    // 2. Dynamic Field'dan Al (Borrow)
    let application_ref = dof::borrow_mut<address, Application>(&mut job.id, applicant);

    // 3. Başvuruyu reddet
    application_ref.is_denied = true;
}

public fun hire(
    job: &mut Job,
    clock: &Clock,
    company_name: vector<u8>,
    job_title: vector<u8>,
    cap: &EmployerCap,
    candidate: address,
    version: &Version,
    ctx: &mut TxContext,
) {
    check_is_valid(version);

    // GÜVENLİK KONTROLÜ (CRITICAL CHECK)
    // Elindeki anahtarın (cap.job_id), kapıyı açmaya çalıştığın ilana (object::id(job))
    // ait olup olmadığını kontrol ediyoruz.
    assert!(cap.job_id == object::id(job), ENotAuthorized);
    assert!(
        dof::borrow<address, Application>(&job.id, candidate).is_denied == false,
        EApplicationDenied,
    );
    // İşe alımı gerçekleştir
    // Option::some ile adresi içine koyuyoruz.
    let candidate_str = candidate;
    job.hired_applicant = option::some(candidate);

    let proof = WorkProof {
        id: object::new(ctx),
        job_id: object::id(job),
        company: string::utf8(company_name),
        title: string::utf8(job_title),
        date_hired: clock.timestamp_ms(),
        recipient: candidate_str,
    };

    // PAYLAŞILAN OBJE (Shared Object)
    // Adaya transfer ETMİYORUZ. Ortaya koyuyoruz.
    // Ama 'recipient' alanı adayı gösterdiği için onunmuş gibi davranacağız.
    transfer::public_transfer(proof, candidate_str);

    sui::event::emit(CandidateHired {
        job_id: object::id(job),
        employer: tx_context::sender(ctx),
        candidate: candidate,
        hired_at: clock.timestamp_ms(),
    });
}

// ============================================================
// 🔐 SEAL ACCESS POLICY (Dokümandaki en önemli kısım)
// ============================================================
// Bu fonksiyonu BİZ çağırmıyoruz. Seal Key Server çağırıyor (Dry Run).
// Amaç: "Bu veriyi (anahtarı) isteyen kişi, gerçekten yetkili mi?"
// Identity olarak Job ID kullanacağız.
const ENoAccess: u64 = 99;

public fun seal_approve(
    job: &Job, // Erişim istenen iş ilanı
    cap: &EmployerCap, // İsteyen kişinin elindeki yetki kartı
    ctx: &TxContext, // İşlemi yapan kişi
) {
    // KURAL: Şifreyi çözmek isteyen kişinin elindeki EmployerCap,
    // bu iş ilanının ID'siyle eşleşmeli.
    assert!(cap.job_id == object::id(job), ENoAccess);

    // Ekstra güvenlik: Cap'in sahibi ile işlemi yapan aynı mı?
    // (Move'da owner check zaten yapılır ama emin olalım)
    // Bu kontrol Key Server'ın simülasyonunda çalışır.
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    transfer::share_object(Version {
        id: object::new(ctx),
        version: VERSION,
    });
    transfer::share_object(JobBoard {
        id: object::new(ctx),
        jobs: vector::empty(),
    });
}
