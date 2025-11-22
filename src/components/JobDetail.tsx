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
import { useState } from "react";

// Mock data - same as HomePage (you'd typically fetch this from API or context)
const ALL_JOBS = [
  {
    id: "1",
    name: "Senior Move Developer",
    employer: "0x1234...5678",
    category: "Engineering",
    description: "We are looking for an experienced Move developer to build secure smart contracts on Sui blockchain. You will work on cutting-edge DeFi protocols and contribute to the core infrastructure of our platform.",
    salary: 150000,
    deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "M",
    requirements: [
      "3+ years of experience in smart contract development",
      "Strong understanding of Move programming language",
      "Experience with Sui blockchain",
      "Knowledge of DeFi protocols and security best practices"
    ],
    responsibilities: [
      "Design and implement smart contracts on Sui blockchain",
      "Collaborate with frontend and backend teams",
      "Conduct code reviews and security audits",
      "Write comprehensive documentation"
    ]
  },
  {
    id: "2",
    name: "Frontend Developer (React)",
    employer: "0x8765...4321",
    category: "Engineering",
    description: "Join our team to build modern Web3 applications with React and TypeScript. Work on innovative blockchain-based user interfaces.",
    salary: 100000,
    deadline: Date.now() + 25 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "S",
    requirements: [
      "5+ years of React development experience",
      "Strong TypeScript skills",
      "Experience with Web3 integrations",
      "Understanding of blockchain concepts"
    ],
    responsibilities: [
      "Build responsive Web3 applications",
      "Integrate wallet connections and blockchain interactions",
      "Optimize application performance",
      "Collaborate with designers and backend developers"
    ]
  },
  {
    id: "3",
    name: "Smart Contract Auditor",
    employer: "0xabcd...ef01",
    category: "Security",
    description: "Audit smart contracts for security vulnerabilities and provide comprehensive reports.",
    salary: 125000,
    deadline: Date.now() + 20 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "O",
    requirements: [
      "Deep understanding of smart contract vulnerabilities",
      "Experience with Solidity, Move, or Rust",
      "Previous auditing experience",
      "Strong analytical skills"
    ],
    responsibilities: [
      "Conduct thorough security audits",
      "Identify and document vulnerabilities",
      "Provide remediation recommendations",
      "Create detailed audit reports"
    ]
  },
  {
    id: "4",
    name: "Product Designer",
    employer: "0x2345...6789",
    category: "Design",
    description: "Design intuitive user experiences for our blockchain-based products.",
    salary: 115000,
    deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "T",
    requirements: [
      "4+ years of product design experience",
      "Strong portfolio showcasing Web3 projects",
      "Proficiency in Figma and design systems",
      "Understanding of blockchain UX patterns"
    ],
    responsibilities: [
      "Create user-centered designs",
      "Develop and maintain design systems",
      "Conduct user research and testing",
      "Collaborate with development teams"
    ]
  },
  {
    id: "5",
    name: "Rust Backend Engineer",
    employer: "0x3456...789a",
    category: "Engineering",
    description: "Build high-performance backend systems using Rust for our NFT marketplace.",
    salary: 135000,
    deadline: Date.now() + 28 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "B",
    requirements: [
      "3+ years of Rust development experience",
      "Experience with microservices architecture",
      "Knowledge of blockchain APIs",
      "Strong problem-solving skills"
    ],
    responsibilities: [
      "Design and implement backend services",
      "Optimize system performance",
      "Integrate with blockchain networks",
      "Maintain code quality and documentation"
    ]
  },
  {
    id: "6",
    name: "DevOps Engineer",
    employer: "0x4567...89ab",
    category: "Infrastructure",
    description: "Manage and scale our blockchain infrastructure and deployment pipelines.",
    salary: 120000,
    deadline: Date.now() + 27 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "S",
    requirements: [
      "Experience with Kubernetes and Docker",
      "Knowledge of CI/CD pipelines",
      "Familiarity with blockchain node infrastructure",
      "Strong scripting skills"
    ],
    responsibilities: [
      "Manage blockchain node infrastructure",
      "Implement CI/CD pipelines",
      "Monitor system performance",
      "Ensure high availability and security"
    ]
  }
];

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [resumeLink, setResumeLink] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"link" | "upload">("link");

  const job = ALL_JOBS.find(j => j.id === jobId);

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

  if (!job) {
    return (
      <Box p="6">
        <Heading>Job not found</Heading>
        <Button mt="4" onClick={() => navigate("/jobs")}>
          Back to Jobs
        </Button>
      </Box>
    );
  }

  const handleApply = () => {
    // TODO: Integrate with smart contract
    const applicationData = {
      jobId: job.id,
      resumeLink: uploadMethod === "link" ? resumeLink : uploadedFile?.name,
      resumeFile: uploadedFile,
      coverLetter
    };
    
    console.log("Application submitted:", applicationData);
    
    // In production, you would upload the file to IPFS or cloud storage first
    // then submit the link to the smart contract
    
    alert("Application submitted successfully!");
    setShowApplicationForm(false);
    setResumeLink("");
    setCoverLetter("");
    setUploadedFile(null);
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
                fallback={job.logo} 
                color="iris" 
                variant="soft" 
                radius="medium"
              />
              <Box style={{ flex: 1 }}>
                <Flex justify="between" align="start" mb="2">
                  <Box>
                    <Heading size="7" mb="2">{job.name}</Heading>
                    <Text size="3" color="gray" weight="medium">
                      Employer: {job.employer}
                    </Text>
                  </Box>
                  <Badge size="3" color="iris" variant="soft">
                    {job.category}
                  </Badge>
                </Flex>

                <Flex gap="4" mt="4" wrap="wrap">
                  <Flex gap="2" align="center">
                    <GlobeIcon />
                    <Text size="2" color="gray">{job.category}</Text>
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
                </Flex>
              </Box>
            </Flex>
          </Card>

          {/* Job Description */}
          <Card size="3" mb="4">
            <Heading size="5" mb="3">Job Description</Heading>
            <Text size="3" color="gray" style={{ lineHeight: "1.7" }}>
              {job.description}
            </Text>
          </Card>

          {/* Requirements */}
          <Card size="3" mb="4">
            <Heading size="5" mb="3">Requirements</Heading>
            <Flex direction="column" gap="2">
              {job.requirements?.map((req, index) => (
                <Flex key={index} gap="2" align="start">
                  <Text color="iris" weight="bold">•</Text>
                  <Text size="2" color="gray">{req}</Text>
                </Flex>
              ))}
            </Flex>
          </Card>

          {/* Responsibilities */}
          <Card size="3">
            <Heading size="5" mb="3">Responsibilities</Heading>
            <Flex direction="column" gap="2">
              {job.responsibilities?.map((resp, index) => (
                <Flex key={index} gap="2" align="start">
                  <Text color="iris" weight="bold">•</Text>
                  <Text size="2" color="gray">{resp}</Text>
                </Flex>
              ))}
            </Flex>
          </Card>

        </Box>

        {/* Sidebar - Right Side (1 column) */}
        <Box>
          
          {/* Salary & Apply Card */}
          <Card size="3" mb="4">
            <Heading size="5" mb="3">Compensation</Heading>
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
            <Heading size="4" mb="3">Job Information : </Heading>
            <Flex direction="column" gap="3">
              <Box>
                <Text size="2" weight="medium" color="gray" mb="1">Category : </Text>
                <Badge color="iris" variant="soft">{job.category}</Badge>
              </Box>
              <Box>
                <Text size="2" weight="medium" color="gray" mb="1">Application Deadline  :</Text>
                <Text size="2">{new Date(job.deadline).toLocaleDateString()}</Text>
              </Box>
              <Box>
                <Text size="2" weight="medium" color="gray" mb="1">Employer Address : </Text>
                <Text size="1" style={{ fontFamily: "monospace" }}>{job.employer}</Text>
              </Box>
            </Flex>
          </Card>

        </Box>

      </Grid>
    </Flex>
  );
}
