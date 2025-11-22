import { Box, Card, Flex, Grid, Heading, Text, Badge, Avatar, Button, Separator, Dialog } from "@radix-ui/themes";
import { 
  CheckCircledIcon, 
  EyeOpenIcon,
  PersonIcon,
  FileTextIcon,
  CalendarIcon,
  ExternalLinkIcon
} from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { useQueryClient } from "@tanstack/react-query";

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicant: string;
  applicantName: string;
  resumeLink: string;
  coverLetter: string;
  appliedAt: number;
  isHired: boolean | null;
}

interface EmployerJob {
  id: string;
  name: string;
  company: string;
  applicants_count: number;
  hired_applicant: string | null;
  employer: string;
}

export default function ReviewApplications() {
  const [employerJobs, setEmployerJobs] = useState<EmployerJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  // Fetch employer's jobs and their applications
  useEffect(() => {
    const fetchEmployerData = async () => {
      if (!account?.address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get all EmployerCap objects owned by the user
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: account.address,
          options: {
            showContent: true,
            showType: true,
          },
        });

        // Filter EmployerCap objects
        const employerCaps = ownedObjects.data.filter((obj) => {
          const type = obj.data?.type;
          return type?.includes("::job_hire::EmployerCap");
        });

        if (employerCaps.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get job IDs from EmployerCaps
        const jobPromises = employerCaps.map(async (cap) => {
          if (cap.data?.content?.dataType === "moveObject") {
            const capFields = cap.data.content.fields as any;
            const jobId = capFields.job_id;

            // Fetch job details
            const jobObject = await suiClient.getObject({
              id: jobId,
              options: { showContent: true },
            });

            if (jobObject.data?.content?.dataType === "moveObject") {
              const jobFields = jobObject.data.content.fields as any;
              return {
                id: jobId,
                name: jobFields.name || "",
                company: jobFields.company || "",
                applicants_count: parseInt(jobFields.applicants_count || "0"),
                hired_applicant: jobFields.hired_applicant || null,
                employer: jobFields.employer || "",
              } as EmployerJob;
            }
          }
          return null;
        });

        const jobs = (await Promise.all(jobPromises)).filter(
          (job): job is EmployerJob => job !== null
        );

        setEmployerJobs(jobs);

        // Fetch all applications for these jobs
        const allApplications: Application[] = [];

        for (const job of jobs) {
          try {
            // Get dynamic fields (applications) for this job
            const dynamicFields = await suiClient.getDynamicFields({
              parentId: job.id,
            });

            for (const field of dynamicFields.data) {
              try {
                const applicationObject = await suiClient.getDynamicFieldObject({
                  parentId: job.id,
                  name: field.name,
                });

                if (applicationObject.data?.content?.dataType === "moveObject") {
                  const appFields = applicationObject.data.content.fields as any;
                  
                  allApplications.push({
                    id: applicationObject.data.objectId,
                    jobId: job.id,
                    jobTitle: job.name,
                    company: job.company,
                    applicant: appFields.applicant || "",
                    applicantName: appFields.applicant_name || "Anonymous User",
                    resumeLink: appFields.resume_link || "",
                    coverLetter: appFields.cover_letter || "",
                    appliedAt: Date.now(),
                    isHired: job.hired_applicant === appFields.applicant ? true : null,
                  });
                }
              } catch (err) {
                console.error("Error fetching application:", err);
              }
            }
          } catch (err) {
            console.error("Error fetching dynamic fields:", err);
          }
        }

        setApplications(allApplications);
      } catch (error) {
        console.error("Error fetching employer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployerData();
  }, [account?.address, suiClient]);

  const handleAction = async (application: Application) => {
    if (!account?.address) {
      alert("Please connect your wallet");
      return;
    }

    try {
      const tx = new Transaction();

      // Call hire function from smart contract
      // Need to find the EmployerCap for this job
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: account.address,
        options: {
          showContent: true,
          showType: true,
        },
      });

      const employerCap = ownedObjects.data.find((obj) => {
        if (obj.data?.content?.dataType === "moveObject") {
          const fields = obj.data.content.fields as any;
          return fields.job_id === application.jobId;
        }
        return false;
      });

      if (!employerCap) {
        alert("You don't have permission to hire for this job");
        return;
      }

      tx.moveCall({
        target: `${import.meta.env.VITE_PACKAGE_ID}::job_hire::hire`,
        arguments: [
          tx.object(application.jobId), // job: &mut Job
          tx.object("0x6"), // clock: &Clock
          tx.pure(bcs.string().serialize(application.company)), // company_name: vector<u8>
          tx.pure(bcs.string().serialize(application.jobTitle)), // job_title: vector<u8>
          tx.object(employerCap.data!.objectId), // cap: &EmployerCap
          tx.pure.address(application.applicant), // candidate: address
          tx.object(import.meta.env.VITE_VERSION_ID), // version: &Version
        ],
      });

      const result = await signAndExecute({ transaction: tx });

      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "testnet" &&
          query.queryKey[1] === "getOwnedObjects",
      });

      alert("Applicant hired successfully on the blockchain!");
      setSelectedApplication(null);

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error("Error hiring applicant:", error);
      alert("Failed to hire applicant. Please try again.");
    }
  };

  const filteredApplications = selectedJob === "all"
    ? applications
    : applications.filter(app => app.jobId === selectedJob);

  const getStatusConfig = (isHired: boolean | null) => {
    if (isHired === true) {
      return { color: "green", icon: <CheckCircledIcon />, label: "Hired" };
    } else {
      return { color: "gray", icon: <PersonIcon />, label: "Pending Review" };
    }
  };

  const pendingCount = applications.filter(a => a.isHired === null).length;
  const hiredCount = applications.filter(a => a.isHired === true).length;

  return (
    <Flex direction="column" gap="6">
      
      {/* Header & Stats */}
      <Flex justify="between" align="end" wrap="wrap" gap="4">
        <Box>
          <Heading size="8" mb="2">Review Applications</Heading>
          <Text color="gray" size="4">
            {!account?.address
              ? "Connect your wallet to review applications"
              : "Manage applications for your job postings"}
          </Text>
        </Box>
        
        {/* Statistics Cards */}
        {account?.address && (
          <Flex gap="3">
            <Card>
              <Flex direction="column" align="center" px="3">
                <Text size="6" weight="bold" color="gray">{pendingCount}</Text>
                <Text size="1" color="gray">Pending</Text>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" align="center" px="3">
                <Text size="6" weight="bold" color="green">{hiredCount}</Text>
                <Text size="1" color="gray">Hired</Text>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" align="center" px="3">
                <Text size="6" weight="bold" color="iris">{employerJobs.length}</Text>
                <Text size="1" color="gray">My Jobs</Text>
              </Flex>
            </Card>
          </Flex>
        )}
      </Flex>

      <Separator size="4" />

      {/* Filter by Job */}
      {account?.address && employerJobs.length > 0 && (
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
            {employerJobs.map((job) => {
              const jobAppCount = applications.filter(a => a.jobId === job.id).length;
              return (
                <Badge
                  key={job.id}
                  size="2"
                  variant={selectedJob === job.id ? "solid" : "soft"}
                  color={selectedJob === job.id ? "iris" : "gray"}
                  style={{ cursor: "pointer", padding: "8px 16px" }}
                  onClick={() => setSelectedJob(job.id)}
                >
                  {job.name} ({jobAppCount})
                </Badge>
              );
            })}
          </Flex>
        </Box>
      )}

      {/* Applications List */}
      <Box>
        <Heading size="5" mb="4">
          Applications ({filteredApplications.length})
        </Heading>
        
        {!account?.address ? (
          <Card size="3">
            <Flex direction="column" align="center" py="6" gap="3">
              <PersonIcon width="48" height="48" color="var(--gray-8)" />
              <Text size="4" color="gray">Connect your wallet</Text>
              <Text size="2" color="gray">
                Connect your wallet to view applications for your job postings
              </Text>
            </Flex>
          </Card>
        ) : isLoading ? (
          <Text size="3" color="gray">Loading applications...</Text>
        ) : employerJobs.length === 0 ? (
          <Card size="3">
            <Flex direction="column" align="center" py="6" gap="3">
              <PersonIcon width="48" height="48" color="var(--gray-8)" />
              <Text size="4" color="gray">No job postings found</Text>
              <Text size="2" color="gray">
                Create a job posting first to receive applications
              </Text>
            </Flex>
          </Card>
        ) : filteredApplications.length === 0 ? (
          <Card size="3">
            <Flex direction="column" align="center" py="6" gap="3">
              <PersonIcon width="48" height="48" color="var(--gray-8)" />
              <Text size="4" color="gray">No applications yet</Text>
              <Text size="2" color="gray">
                Applications will appear here when candidates apply to your jobs
              </Text>
            </Flex>
          </Card>
        ) : (
          <Grid columns="1" gap="4">
            {filteredApplications.map((app) => {
              const statusConfig = getStatusConfig(app.isHired);
              
              return (
                <Card key={app.id} size="3">
                  <Flex gap="4" align="start">
                    
                    {/* Avatar */}
                    <Avatar 
                      size="5" 
                      fallback={app.applicantName.substring(0, 2).toUpperCase()} 
                      color="iris" 
                      variant="soft" 
                      radius="full"
                    />

                    {/* Content */}
                    <Box style={{ flex: 1 }}>
                      <Flex justify="between" align="start" mb="2">
                        <Box>
                          <Heading size="4" mb="1">
                            {app.applicantName}
                          </Heading>
                          <Text size="2" color="gray" weight="medium">
                            Applied for: {app.jobTitle}
                          </Text>
                          <Text size="1" color="gray">
                            {app.company}
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
                      <Box mb="3">
                        <Flex gap="2" align="center" mb="2">
                          <PersonIcon color="gray" width="14" height="14" />
                          <Text size="2" color="gray" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                            {app.applicant}
                          </Text>
                        </Flex>
                        <Flex gap="2" align="center">
                          <CalendarIcon color="gray" width="14" height="14" />
                          <Text size="2" color="gray">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </Text>
                        </Flex>
                      </Box>

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
                                  <Text size="2" weight="medium" mb="1">Applicant : </Text>
                                  <Text size="3" weight="medium">{selectedApplication.applicantName}</Text>
                                </Box>

                                <Box>
                                  <Text size="2" weight="medium" mb="1">Wallet Address : </Text>
                                  <Text size="1" color="gray" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                                    {selectedApplication.applicant}
                                  </Text>
                                </Box>

                                <Box>
                                  <Text size="2" weight="medium" mb="1">Job Position : </Text>
                                  <Text size="2">{selectedApplication.jobTitle}</Text>
                                  <Text size="1" color="gray">{selectedApplication.company}</Text>
                                </Box>

                                <Box>
                                  <Text size="2" weight="medium" mb="2">Resume : </Text>
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

                                {selectedApplication.isHired === null && (
                                  <Flex gap="3" mt="2">
                                    <Button
                                      style={{ flex: 1 }}
                                      color="green"
                                      onClick={() => handleAction(selectedApplication)}
                                    >
                                      <CheckCircledIcon />
                                      Hire Applicant
                                    </Button>
                                  </Flex>
                                )}

                                {selectedApplication.isHired === true && (
                                  <Card variant="surface" style={{ backgroundColor: "var(--green-2)" }}>
                                    <Text size="2" weight="medium">
                                      Status: Hired ✓
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

                        {app.isHired === null && (
                          <Button
                            size="2"
                            color="green"
                            variant="soft"
                            onClick={() => handleAction(app)}
                          >
                            <CheckCircledIcon />
                            Hire
                          </Button>
                        )}
                      </Flex>
                    </Box>
                  </Flex>
                </Card>
              );
            })}
          </Grid>
        )}
      </Box>
    </Flex>
  );
}
