/// Module: job_hire
module job_hire::job_hire;

use std::option::{Self, Option};
use std::string::{Self, String};
use std::vector;
use sui::clock::{Self, Clock};
use sui::display;
use sui::dynamic_object_field as dof;
use sui::event;
use sui::object::{Self, UID, ID};
use sui::package;
use sui::transfer;
use sui::tx_context::{Self, TxContext};

public struct Version has key {
    id: UID,
    version: u64,
}

// ERROR CODES
const EInvalidPublisher: u64 = 0;
const EInvalidPackageVersion: u64 = 1;
const EAlreadyApplied: u64 = 2;
const ENotAuthorized: u64 = 3;
const EDeadlinePassed: u64 = 4;
const EApplicationDenied: u64 = 5; // <--- EKSİKTİ, EKLENDİ

const VERSION: u64 = 3;

// --- EVENTS ---
public struct JobCreated has copy, drop {
    job_id: ID,
    employer: address,
    company: String,
    title: String,
    deadline: u64,
}
public struct ApplicationSubmitted has copy, drop {
    job_id: ID,
    applicant: address,
    applicant_name: String,
    timestamp: u64,
}
public struct CandidateHired has copy, drop {
    job_id: ID,
    employer: address,
    candidate: address,
    hired_at: u64,
}

public struct ApplicationDenied has copy, drop {
    job_id: ID,
    applicant: address,
    timestamp: u64,
}

public struct ApplicationCancelled has copy, drop {
    job_id: ID,
    applicant: address,
    timestamp: u64,
}

// --- STRUCTS ---

public struct WorkProof has key, store {
    id: UID,
    job_id: ID,
    company: String,
    title: String,
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
    company: String,
    location: String,
    employer: address,
    category: String,
    name: String,
    description: String,
    salary: Option<u64>,
    deadline: u64,
    applicants_count: u64,
    hired_applicant: Option<address>,
}

public struct Application has key, store {
    id: UID,
    job_id: ID,
    applicant_name: String,
    applicant: address,
    resume_link: String,
    cover_letter: String,
    is_denied: bool,
}

public struct EmployerCap has key, store {
    id: UID,
    job_id: ID,
}

// --- INIT ---
fun init(otw: JOB_HIRE, ctx: &mut TxContext) {
    let publisher = package::claim(otw, ctx);

    let keys = vector[
        b"name".to_string(),
        b"link".to_string(),
        b"image_url".to_string(),
        b"description".to_string(),
        b"project_url".to_string(),
        b"creator".to_string(),
    ];

    let values = vector[
        b"Badge: {title} at {company}".to_string(),
        b"https://jobbster.app/badge/{id}".to_string(),
        b"https://ajanspr.com.tr/wp-content/uploads/2023/08/gold-tik-altin-tik-blue-tick-mavi-tick-instagram.jpg".to_string(),
        b"Employment Proof.".to_string(),
        b"https://jobbster.app".to_string(),
        b"Jobbster".to_string(),
    ];

    let mut display = display::new_with_fields<WorkProof>(
        &publisher,
        keys,
        values,
        ctx,
    );
    display::update_version(&mut display);
    transfer::public_transfer(display, tx_context::sender(ctx));

    transfer::share_object(Version { id: object::new(ctx), version: VERSION });
    transfer::share_object(JobBoard { id: object::new(ctx), jobs: vector::empty() });
    transfer::public_transfer(publisher, tx_context::sender(ctx));
}

// --- CHECKS ---
public fun migrate(publisher: &package::Publisher, version: &mut Version) {
    assert!(publisher.from_package<JOB_HIRE>(), EInvalidPublisher);
    version.version = VERSION;
}

public fun check_is_valid(self: &Version) {
    assert!(self.version == VERSION, EInvalidPackageVersion);
}

// --- ENTRY FUNCTIONS ---

public fun create_job(
    job_board: &mut JobBoard,
    version: &Version,
    company: vector<u8>,
    location: vector<u8>,
    category: vector<u8>,
    name: vector<u8>,
    description: vector<u8>,
    salary: Option<u64>,
    deadline: u64,
    ctx: &mut TxContext,
) {
    check_is_valid(version);
    let sender = tx_context::sender(ctx);
    let job_uid = object::new(ctx);
    let job_id = object::uid_to_inner(&job_uid);

    let company_str = string::utf8(company);
    let title_str = string::utf8(name);

    let job = Job {
        id: job_uid,
        employer: sender,
        company: company_str,
        location: string::utf8(location),
        category: string::utf8(category),
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

    transfer::share_object(job);
    transfer::public_transfer(employer_cap, sender);
    vector::push_back(&mut job_board.jobs, job_id);

    event::emit(JobCreated {
        job_id: job_id,
        employer: sender,
        company: company_str,
        title: title_str,
        deadline: deadline,
    });
}

public fun apply(
    job: &mut Job,
    applicant_name: vector<u8>,
    version: &Version,
    clock: &Clock,
    resume_link: vector<u8>,
    cover_letter: vector<u8>,
    ctx: &mut TxContext,
) {
    check_is_valid(version);
    let applicant = tx_context::sender(ctx);
    let applicant_name_str = string::utf8(applicant_name);

    assert!(clock.timestamp_ms() <= job.deadline, EDeadlinePassed);
    assert!(!dof::exists_(&job.id, applicant), EAlreadyApplied);

    let application = Application {
        id: object::new(ctx),
        job_id: object::id(job),
        applicant_name: applicant_name_str,
        applicant: applicant,
        is_denied: false,
        resume_link: string::utf8(resume_link),
        cover_letter: string::utf8(cover_letter),
    };

    dof::add(&mut job.id, applicant, application);
    job.applicants_count = job.applicants_count + 1;

    event::emit(ApplicationSubmitted {
        job_id: object::id(job),
        applicant: applicant,
        applicant_name: applicant_name_str,
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

    assert!(dof::exists_(&job.id, applicant), ENotAuthorized);

    let application_obj = dof::remove<address, Application>(&mut job.id, applicant);

    let Application {
        id,
        job_id: _,
        applicant_name: _,
        applicant: _,
        resume_link: _,
        cover_letter: _,
        is_denied: _,
    } = application_obj;

    object::delete(id);
    job.applicants_count = job.applicants_count - 1;

    event::emit(ApplicationCancelled {
        job_id: object::id(job),
        applicant: applicant,
        timestamp: clock.timestamp_ms(),
    });
}

// Güvenlik Kontrolü: EmployerCap istiyorum
public fun deny_application(
    job: &mut Job,
    cap: &EmployerCap,
    applicant: address,
    clock: &Clock,
    version: &Version,
    _ctx: &mut TxContext,
) {
    check_is_valid(version);
    assert!(cap.job_id == object::id(job), ENotAuthorized);
    assert!(dof::exists_(&job.id, applicant), ENotAuthorized);

    let application_ref = dof::borrow_mut<address, Application>(&mut job.id, applicant);
    application_ref.is_denied = true;

    event::emit(ApplicationDenied {
        job_id: object::id(job),
        applicant: applicant,
        timestamp: clock.timestamp_ms(),
    });
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
    assert!(cap.job_id == object::id(job), ENotAuthorized);

    // Reddedilen adayı işe almama kontrolü
    let application_ref = dof::borrow<address, Application>(&job.id, candidate);
    assert!(application_ref.is_denied == false, EApplicationDenied);

    job.hired_applicant = option::some(candidate);

    let proof = WorkProof {
        id: object::new(ctx),
        job_id: object::id(job),
        company: string::utf8(company_name),
        title: string::utf8(job_title),
        date_hired: clock.timestamp_ms(),
        recipient: candidate,
    };

    // Adaya transfer ediyoruz
    transfer::transfer(proof, candidate);

    event::emit(CandidateHired {
        job_id: object::id(job),
        employer: tx_context::sender(ctx),
        candidate: candidate,
        hired_at: clock.timestamp_ms(),
    });
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    transfer::share_object(Version { id: object::new(ctx), version: VERSION });
    transfer::share_object(JobBoard { id: object::new(ctx), jobs: vector::empty() });
}
