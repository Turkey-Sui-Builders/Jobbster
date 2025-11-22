import { Box, Card, Flex, Grid, Heading, Text, Badge, Avatar, Button, Separator, TextArea, Dialog } from "@radix-ui/themes";
import { 
  CheckCircledIcon, 
  CrossCircledIcon, 
  EyeOpenIcon,
  PersonIcon,
  FileTextIcon,
  CalendarIcon,
  ExternalLinkIcon
} from "@radix-ui/react-icons";
import { useState } from "react";

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  applicant: string; // wallet address
  applicantName: string;
  resumeLink: string;
  coverLetter: string;
  appliedAt: string;
  status: "pending" | "reviewed" | "hired" | "rejected";
}

// Mock data - Applications for employer's jobs
const MOCK_APPLICATIONS: Application[] = [
  {
    id: "1",
    jobId: "job_1",
    jobTitle: "Senior Move Developer",
    applicant: "0xabcd...1234",
    applicantName: "Alice Johnson",
    resumeLink: "https://example.com/resume/alice.pdf",
    coverLetter: "I have 6 years of experience in blockchain development, with 3 years specifically working with Move language on Sui. I've built several DeFi protocols and NFT marketplaces. I'm passionate about building secure and efficient smart contracts.",
    appliedAt: "2 days ago",
    status: "pending"
  },
  {
    id: "2",
    jobId: "job_1",
    jobTitle: "Senior Move Developer",
    applicant: "0xef12...5678",
    applicantName: "Bob Smith",
    resumeLink: "https://example.com/resume/bob.pdf",
    coverLetter: "As a blockchain engineer with extensive Rust background, I've been focusing on Move development for the past year. I contributed to several open-source Sui projects and have deep understanding of object-centric programming model.",
    appliedAt: "3 days ago",
    status: "reviewed"
  },
  {
    id: "3",
    jobId: "job_2",
    jobTitle: "Frontend Developer (React)",
    applicant: "0x9876...abcd",
    applicantName: "Carol Davis",
    resumeLink: "https://example.com/resume/carol.pdf",
    coverLetter: "I'm a frontend developer with 5 years of React experience and strong Web3 integration skills. I've built several dApp interfaces and understand wallet connections, transaction signing, and blockchain state management.",
    appliedAt: "5 days ago",
    status: "pending"
  },
  {
    id: "4",
    jobId: "job_2",
    jobTitle: "Frontend Developer (React)",
    applicant: "0x4567...ef89",
    applicantName: "David Wilson",
    resumeLink: "https://example.com/resume/david.pdf",
    coverLetter: "Frontend engineer specializing in React and TypeScript. I've worked on multiple Web3 projects and have experience with Sui SDK. I focus on creating intuitive user experiences for complex blockchain interactions.",
    appliedAt: "1 week ago",
    status: "rejected"
  },
  {
    id: "5",
    jobId: "job_1",
    jobTitle: "Senior Move Developer",
    applicant: "0x1111...2222",
    applicantName: "Emma Brown",
    resumeLink: "https://example.com/resume/emma.pdf",
    coverLetter: "Former Solidity developer transitioning to Move. I have 4 years in smart contract development and completed Sui Move certification. I'm excited about the safety features and composability that Move offers.",
    appliedAt: "1 week ago",
    status: "hired"
  }
];

const MOCK_JOBS = [
  { id: "job_1", title: "Senior Move Developer", applicantCount: 3 },
  { id: "job_2", title: "Frontend Developer (React)", applicantCount: 2 }
];

export default function ReviewApplications() {
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [actionNote, setActionNote] = useState("");

  const handleAction = (applicationId: string, action: "hire" | "reject") => {
    // TODO: Integrate with smart contract
    // Update application status on blockchain
    
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, status: action === "hire" ? "hired" : "rejected" }
          : app
      )
    );
    
    setSelectedApplication(null);
    setActionNote("");
    
    const actionText = action === "hire" ? "hired" : "rejected";
    alert(`Applicant ${actionText} successfully!`);
  };

  const filteredApplications = selectedJob === "all"
    ? applications
    : applications.filter(app => app.jobId === selectedJob);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "hired":
        return { color: "green", icon: <CheckCircledIcon />, label: "Hired" };
      case "rejected":
        return { color: "red", icon: <CrossCircledIcon />, label: "Rejected" };
      case "reviewed":
        return { color: "blue", icon: <EyeOpenIcon />, label: "Reviewed" };
      default:
        return { color: "gray", icon: <PersonIcon />, label: "Pending Review" };
    }
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;
  const reviewedCount = applications.filter(a => a.status === "reviewed").length;
  const hiredCount = applications.filter(a => a.status === "hired").length;

  return (
    <Flex direction="column" gap="6">
      
      {/* Header & Stats */}
      <Flex justify="between" align="end" wrap="wrap" gap="4">
        <Box>
          <Heading size="8" mb="2">Review Applications</Heading>
          <Text color="gray" size="4">
            Manage applications for your job postings
          </Text>
        </Box>
        
        {/* Statistics Cards */}
        <Flex gap="3">
          <Card>
            <Flex direction="column" align="center" px="3">
              <Text size="6" weight="bold" color="gray">{pendingCount}</Text>
              <Text size="1" color="gray">Pending</Text>
            </Flex>
          </Card>
          <Card>
            <Flex direction="column" align="center" px="3">
              <Text size="6" weight="bold" color="blue">{reviewedCount}</Text>
              <Text size="1" color="gray">Reviewed</Text>
            </Flex>
          </Card>
          <Card>
            <Flex direction="column" align="center" px="3">
              <Text size="6" weight="bold" color="green">{hiredCount}</Text>
              <Text size="1" color="gray">Hired</Text>
            </Flex>
          </Card>
        </Flex>
      </Flex>

      <Separator size="4" />

      {/* Filter by Job */}
      <Box>
        <Text size="2" weight="medium" mb="3">Filter by Job:</Text>
        <Flex gap="2" wrap="wrap">
          <Badge
            size="2"
            variant={selectedJob === "all" ? "solid" : "soft"}
            color={selectedJob === "all" ? "iris" : "gray"}
            style={{ cursor: "pointer", padding: "8px 16px" }}
            onClick={() => setSelectedJob("all")}
          >
            All Jobs ({applications.length})
          </Badge>
          {MOCK_JOBS.map((job) => (
            <Badge
              key={job.id}
              size="2"
              variant={selectedJob === job.id ? "solid" : "soft"}
              color={selectedJob === job.id ? "iris" : "gray"}
              style={{ cursor: "pointer", padding: "8px 16px" }}
              onClick={() => setSelectedJob(job.id)}
            >
              {job.title} ({job.applicantCount})
            </Badge>
          ))}
        </Flex>
      </Box>

      {/* Applications List */}
      <Box>
        <Heading size="5" mb="4">
          Applications ({filteredApplications.length})
        </Heading>
        
        <Grid columns="1" gap="4">
          {filteredApplications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            
            return (
              <Card key={app.id} size="3">
                <Flex gap="4" align="start">
                  
                  {/* Avatar */}
                  <Avatar 
                    size="5" 
                    fallback={app.applicantName.charAt(0)} 
                    color="iris" 
                    variant="soft" 
                    radius="full"
                  />

                  {/* Content */}
                  <Box style={{ flex: 1 }}>
                    <Flex justify="between" align="start" mb="2">
                      <Box>
                        <Heading size="4" mb="1">{app.applicantName}</Heading>
                        <Text size="2" color="gray" weight="medium">
                          Applied for: {app.jobTitle}
                        </Text>
                      </Box>
                      <Badge color={statusConfig.color as any} size="2" variant="soft">
                        <Flex gap="1" align="center">
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Flex>
                      </Badge>
                    </Flex>

                    {/* Applicant Info */}
                    <Grid columns={{ initial: "1", sm: "2" }} gap="2" mb="3">
                      <Flex gap="2" align="center">
                        <PersonIcon color="gray" width="14" height="14" />
                        <Text size="2" color="gray" style={{ fontFamily: "monospace" }}>
                          {app.applicant}
                        </Text>
                      </Flex>
                      <Flex gap="2" align="center">
                        <CalendarIcon color="gray" width="14" height="14" />
                        <Text size="2" color="gray">{app.appliedAt}</Text>
                      </Flex>
                    </Grid>

                    {/* Cover Letter Preview */}
                    <Box mb="3">
                      <Text size="2" weight="medium" mb="1">Cover Letter:</Text>
                      <Text size="2" color="gray" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {app.coverLetter}
                      </Text>
                    </Box>

                    {/* Action Buttons */}
                    <Flex gap="2" wrap="wrap">
                      <Dialog.Root>
                        <Dialog.Trigger>
                          <Button
                            size="2"
                            variant="soft"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <EyeOpenIcon />
                            View Details
                          </Button>
                        </Dialog.Trigger>

                        <Dialog.Content style={{ maxWidth: "600px" }}>
                          <Dialog.Title>Application Details</Dialog.Title>
                          
                          {selectedApplication && (
                            <Flex direction="column" gap="4" mt="4">
                              <Box>
                                <Text size="2" weight="medium" mb="1">Applicant:</Text>
                                <Text size="2">{selectedApplication.applicantName}</Text>
                                <Text size="1" color="gray" style={{ fontFamily: "monospace" }}>
                                  {selectedApplication.applicant}
                                </Text>
                              </Box>

                              <Box>
                                <Text size="2" weight="medium" mb="1">Job Position:</Text>
                                <Text size="2">{selectedApplication.jobTitle}</Text>
                              </Box>

                              <Box>
                                <Text size="2" weight="medium" mb="2">Resume:</Text>
                                <Button
                                  variant="soft"
                                  size="2"
                                  asChild
                                >
                                  <a href={selectedApplication.resumeLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLinkIcon />
                                    View Resume
                                  </a>
                                </Button>
                              </Box>

                              <Box>
                                <Text size="2" weight="medium" mb="2">Cover Letter:</Text>
                                <Box
                                  p="3"
                                  style={{
                                    backgroundColor: "var(--gray-2)",
                                    borderRadius: "8px",
                                    maxHeight: "200px",
                                    overflow: "auto"
                                  }}
                                >
                                  <Text size="2">{selectedApplication.coverLetter}</Text>
                                </Box>
                              </Box>

                              {selectedApplication.status === "pending" && (
                                <>
                                  <Box>
                                    <Text size="2" weight="medium" mb="2">Add Note (Optional):</Text>
                                    <TextArea
                                      placeholder="Add feedback or reasons for your decision..."
                                      rows={3}
                                      value={actionNote}
                                      onChange={(e) => setActionNote(e.target.value)}
                                    />
                                  </Box>

                                  <Flex gap="3" mt="2">
                                    <Button
                                      style={{ flex: 1 }}
                                      color="green"
                                      onClick={() => handleAction(selectedApplication.id, "hire")}
                                    >
                                      <CheckCircledIcon />
                                      Hire Applicant
                                    </Button>
                                    <Button
                                      style={{ flex: 1 }}
                                      color="red"
                                      variant="soft"
                                      onClick={() => handleAction(selectedApplication.id, "reject")}
                                    >
                                      <CrossCircledIcon />
                                      Reject
                                    </Button>
                                  </Flex>
                                </>
                              )}

                              {selectedApplication.status !== "pending" && (
                                <Card variant="surface" style={{ 
                                  backgroundColor: selectedApplication.status === "hired" ? "var(--green-2)" : "var(--red-2)" 
                                }}>
                                  <Text size="2" weight="medium">
                                    Status: {statusConfig.label}
                                  </Text>
                                </Card>
                              )}
                            </Flex>
                          )}

                          <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                              <Button variant="soft" color="gray">
                                Close
                              </Button>
                            </Dialog.Close>
                          </Flex>
                        </Dialog.Content>
                      </Dialog.Root>

                      <a href={app.resumeLink} target="_blank" rel="noopener noreferrer">
                        <Button size="2" variant="soft" color="gray">
                          <FileTextIcon />
                          Resume
                        </Button>
                      </a>

                      {app.status === "pending" && (
                        <>
                          <Button
                            size="2"
                            color="green"
                            variant="soft"
                            onClick={() => {
                              setSelectedApplication(app);
                              handleAction(app.id, "hire");
                            }}
                          >
                            <CheckCircledIcon />
                            Hire
                          </Button>
                          <Button
                            size="2"
                            color="red"
                            variant="soft"
                            onClick={() => {
                              setSelectedApplication(app);
                              handleAction(app.id, "reject");
                            }}
                          >
                            <CrossCircledIcon />
                            Reject
                          </Button>
                        </>
                      )}
                    </Flex>
                  </Box>
                </Flex>
              </Card>
            );
          })}
        </Grid>

        {filteredApplications.length === 0 && (
          <Card size="3">
            <Flex direction="column" align="center" py="6" gap="3">
              <PersonIcon width="48" height="48" color="var(--gray-8)" />
              <Text size="4" color="gray">No applications found</Text>
              <Text size="2" color="gray">
                Applications will appear here when candidates apply to your jobs
              </Text>
            </Flex>
          </Card>
        )}
      </Box>
    </Flex>
  );
}
