import { Box, Card, Flex, Heading, Text, Avatar, Button, Badge, Separator, TextField, TextArea, Grid } from "@radix-ui/themes";
import { 
  GlobeIcon,
  RocketIcon,
  PersonIcon,
  CalendarIcon,
  ArrowLeftIcon,
  UploadIcon,
  FileTextIcon
} from "@radix-ui/react-icons";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { useQueryClient } from "@tanstack/react-query";

interface Job {
  id: string;
  name: string;
  company: string;
  location: string;
  employer: string;
  category: string;
  description: string;
  salary: number | null;
  deadline: number;
  hired_applicant: string | null;
  applicants_count: number;
}

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"link" | "upload">("link");

  // Fetch job details from blockchain
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      try {
        setIsLoading(true);
        
        const jobObject = await suiClient.getObject({
          id: jobId,
          options: {
            showContent: true,
          },
        });

        if (jobObject.data?.content?.dataType === "moveObject") {
          const jobFields = jobObject.data.content.fields as any;
          setJob({
            id: jobId,
            name: jobFields.name || "",
            company: jobFields.company || "",
            location: jobFields.location || "",
            employer: jobFields.employer || "",
            category: jobFields.category || "",
            description: jobFields.description || "",
            salary: jobFields.salary ? parseInt(jobFields.salary) : null,
            deadline: parseInt(jobFields.deadline),
            hired_applicant: jobFields.hired_applicant || null,
            applicants_count: parseInt(jobFields.applicants_count || "0"),
          });
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, suiClient]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type (PDF, DOC, DOCX)
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setUploadedFile(file);
    }
  };

  if (isLoading) {
    return (
      <Box p="6">
        <Text size="4" color="gray">Loading job details...</Text>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box p="6">
        <Heading>Job not found</Heading>
        <Button mt="4" onClick={() => navigate("/jobs")}>
          <ArrowLeftIcon />
          Back to Jobs
        </Button>
      </Box>
    );
  }

  const handleApply = async () => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!job) return;

    // Check if deadline has passed
    if (Date.now() > job.deadline) {
      alert("Application deadline has passed for this job");
      return;
    }

    try {
      // TODO: Upload file to IPFS if uploadMethod is "upload"
      // For now, we'll use the link or file name
      const finalResumeLink = uploadMethod === "link" 
        ? resumeLink 
        : `ipfs://placeholder/${uploadedFile?.name}`; // Placeholder for IPFS upload

      const tx = new Transaction();

      // Call apply function from smart contract
      tx.moveCall({
        target: `${import.meta.env.VITE_PACKAGE_ID}::job_hire::apply`,
        arguments: [
          tx.object(job.id), // job: &mut Job
          tx.pure(bcs.string().serialize(applicantName)), // applicant_name: vector<u8>
          tx.object(import.meta.env.VITE_VERSION_ID), // version: &Version
          tx.object("0x6"), // clock: &Clock (Sui shared Clock object)
          tx.pure(bcs.string().serialize(finalResumeLink)), // resume_link: vector<u8>
          tx.pure(bcs.string().serialize(coverLetter)), // cover_letter: vector<u8>
        ],
      });

      // Sign and execute transaction (wallet will ask for approval)
      const result = await signAndExecute({ transaction: tx });
      
      // Wait for transaction confirmation
      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      // Refresh cached data
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "testnet" &&
          query.queryKey[1] === "getOwnedObjects",
      });

      alert("Application submitted successfully on the blockchain!");
      setShowApplicationForm(false);
      setApplicantName("");
      setResumeLink("");
      setCoverLetter("");
      setUploadedFile(null);
      
      // Refresh job details to update applicant count
      const jobObject = await suiClient.getObject({
        id: job.id,
        options: { showContent: true },
      });
      if (jobObject.data?.content?.dataType === "moveObject") {
        const jobFields = jobObject.data.content.fields as any;
        setJob({
          ...job,
          applicants_count: parseInt(jobFields.applicants_count || "0"),
        });
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      
      // Handle specific error cases
      if (error?.message?.includes("EAlreadyApplied")) {
        alert("You have already applied to this job");
      } else if (error?.message?.includes("EDeadlinePassed")) {
        alert("Application deadline has passed for this job");
      } else {
        alert("Failed to submit application. Please try again.");
      }
    }
  };

  return (
    <Flex direction="column" gap="6">
      
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="2" 
        onClick={() => navigate("/jobs")}
        style={{ width: "fit-content" }}
      >
        <ArrowLeftIcon />
        Back to Jobs
      </Button>

      <Grid columns={{ initial: "1", md: "3" }} gap="6">
        
        {/* Main Content - Left Side (2 columns) */}
        <Box style={{ gridColumn: "span 2" }}>
          
          {/* Job Header */}
          <Card size="3" mb="4">
            <Flex gap="4" align="start">
              <Avatar 
                size="6" 
                fallback={job.company.charAt(0).toUpperCase()} 
                color="iris" 
                variant="soft" 
                radius="medium"
              />
              <Box style={{ flex: 1 }}>
                <Flex justify="between" align="start" mb="2">
                  <Box>
                    <Heading size="7" mb="2">{job.name}</Heading>
                    <Text size="3" color="gray" weight="medium">
                      {job.company}
                    </Text>
                    <Text size="2" color="gray" mt="1">
                      Employer: {job.employer.substring(0, 8)}...{job.employer.slice(-6)}
                    </Text>
                  </Box>
                  <Badge size="3" color="iris" variant="soft">
                    {job.category}
                  </Badge>
                </Flex>

                <Flex gap="4" mt="4" wrap="wrap">
                  <Flex gap="2" align="center">
                    <GlobeIcon />
                    <Text size="2" color="gray">{job.location}</Text>
                  </Flex>
                  <Flex gap="2" align="center">
                    <CalendarIcon />
                    <Text size="2" color="gray">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </Text>
                  </Flex>
                  <Flex gap="2" align="center">
                    <PersonIcon />
                    <Text size="2" color="gray">
                      {job.hired_applicant ? "Position Filled" : "Open Position"}
                    </Text>
                  </Flex>
                  <Flex gap="2" align="center">
                    <PersonIcon />
                    <Text size="2" color="gray">
                      {job.applicants_count} Applicants
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </Card>

          {/* Job Description */}
          <Card size="3" mb="4">
            <Heading size="5" mb="3">Job Description</Heading>
            <Text size="3" color="gray" style={{ lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
              {job.description}
            </Text>
          </Card>

        </Box>

        {/* Sidebar - Right Side (1 column) */}
        <Box>
          
          {/* Salary & Apply Card */}
          <Card size="3" mb="4">
            <Heading size="5" mb="3">Salary</Heading>
            <Text size="7" weight="bold" color="iris" mb="4">
              {job.salary ? `$${(job.salary / 1000).toFixed(0)}k / year` : 'Not specified'}
            </Text>
            
            <Separator size="4" mb="4" />
            
            {!showApplicationForm ? (
              <Button 
                size="3" 
                style={{ width: "100%" }}
                onClick={() => setShowApplicationForm(true)}
              >
                <RocketIcon />
                Apply 
              </Button>
            ) : (
              <Flex direction="column" gap="3">
                <Heading size="4" mb="2">Submit Application</Heading>
                
                {/* Full Name */}
                <Box>
                  <Text size="2" weight="medium" mb="2">Full Name *</Text>
                  <TextField.Root
                    placeholder="John Doe"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                  />
                </Box>
                
                {/* Upload Method Selector */}
                <Box>
                  <Text size="2" weight="medium" mb="2">Resume *</Text>
                  <Flex gap="2" mb="3">
                    <Button
                      size="2"
                      variant={uploadMethod === "link" ? "solid" : "soft"}
                      color={uploadMethod === "link" ? "iris" : "gray"}
                      onClick={() => setUploadMethod("link")}
                      style={{ flex: 1, cursor: "pointer" }}
                    >
                      Provide Link
                    </Button>
                    <Button
                      size="2"
                      variant={uploadMethod === "upload" ? "solid" : "soft"}
                      color={uploadMethod === "upload" ? "iris" : "gray"}
                      onClick={() => setUploadMethod("upload")}
                      style={{ flex: 1, cursor: "pointer" }}
                    >
                      Upload File
                    </Button>
                  </Flex>

                  {uploadMethod === "link" ? (
                    <Box>
                      <TextField.Root
                        placeholder="https://..."
                        value={resumeLink}
                        onChange={(e) => setResumeLink(e.target.value)}
                      />
                      <Text size="1" color="gray" mt="1">
                        Link to your online resume (Google Drive, Dropbox, etc.)
                      </Text>
                    </Box>
                  ) : (
                    <Box>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload">
                        <Button
                          size="3"
                          variant="soft"
                          style={{ width: "100%", cursor: "pointer" }}
                          asChild
                        >
                          <span>
                            <UploadIcon />
                            {uploadedFile ? "Change File" : "Choose File"}
                          </span>
                        </Button>
                      </label>
                      {uploadedFile && (
                        <Flex align="center" gap="2" mt="2" p="2" style={{ 
                          backgroundColor: "var(--accent-2)", 
                          borderRadius: "6px" 
                        }}>
                          <FileTextIcon color="var(--accent-9)" />
                          <Text size="2" style={{ flex: 1 }}>{uploadedFile.name}</Text>
                          <Text size="1" color="gray">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </Text>
                        </Flex>
                      )}
                      <Text size="1" color="gray" mt="1">
                        PDF or Word document (max 5MB)
                      </Text>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2">Cover Letter *</Text>
                  <TextArea
                    placeholder="Tell us why you're a great fit..."
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </Box>

                <Flex gap="2" mt="2">
                  <Button 
                    variant="solid" 
                    style={{ flex: 1 }}
                    onClick={handleApply}
                    disabled={
                      !applicantName ||
                      (uploadMethod === "link" && !resumeLink) || 
                      (uploadMethod === "upload" && !uploadedFile) || 
                      !coverLetter
                    }
                  >
                    Submit
                  </Button>
                  <Button 
                    variant="soft" 
                    color="gray"
                    onClick={() => {
                      setShowApplicationForm(false);
                      setApplicantName("");
                      setResumeLink("");
                      setCoverLetter("");
                      setUploadedFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                </Flex>
              </Flex>
            )}
          </Card>

          {/* Job Info Card */}
          <Card size="3">
            <Heading size="4" mb="3">Job Information</Heading>
            <Flex direction="column" gap="3">
              <Box>
                <Text size="2" weight="medium" color="gray" mb="1">Company : </Text>
                <Text size="2" weight="bold">{job.company}</Text>
              </Box>
              <Box>
                <Text size="2" weight="medium" color="gray" mb="1">Location : </Text>
                <Text size="2">{job.location}</Text>
              </Box>
              <Box>
                <Text size="2" weight="medium" color="gray" mb="1">Category : </Text>
                <Badge color="iris" variant="soft">{job.category}</Badge>
              </Box>
              <Box>
                <Text size="2" weight="medium" color="gray" mb="1">Application Deadline : </Text>
                <Text size="2">{new Date(job.deadline).toLocaleDateString()}</Text>
              </Box>
              <Box>
                <Text size="2" weight="medium" color="gray" mb="1">Total Applicants : </Text>
                <Text size="2" weight="bold" color="iris">{job.applicants_count}</Text>
              </Box>
            </Flex>
          </Card>

        </Box>

      </Grid>
    </Flex>
  );
}
