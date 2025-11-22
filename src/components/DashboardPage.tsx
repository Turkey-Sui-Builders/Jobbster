import { Box, Card, Flex, Grid, Heading, Text, Badge, Avatar, Separator } from "@radix-ui/themes";
import { 
  CheckCircledIcon, 
  ClockIcon, 
  LaptopIcon, 
  CrossCircledIcon,
  PaperPlaneIcon,
  GlobeIcon
} from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";

interface Application {
  id: string;
  job_id: string;
  jobTitle: string;
  company: string;
  location: string;
  category: string;
  applicant: string;
  resume_link: string;
  cover_letter: string;
  applied_at: number;
}

// Status Config Helper
const getStatusConfig = (hired: boolean | null) => {
  if (hired === true) {
    return { color: "green", icon: <CheckCircledIcon />, label: "Hired" };
  } else if (hired === false) {
    return { color: "red", icon: <CrossCircledIcon />, label: "Not Selected" };
  } else {
    return { color: "blue", icon: <PaperPlaneIcon />, label: "Applied" };
  }
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const navigate = useNavigate();

  // Fetch user's applications from blockchain
  useEffect(() => {
    const fetchApplications = async () => {
      if (!account?.address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get JobBoard to access all job IDs
        const jobBoard = await suiClient.getObject({
          id: import.meta.env.VITE_JOB_BOARD_ID,
          options: {
            showContent: true,
          },
        });

        if (jobBoard.data?.content?.dataType === "moveObject") {
          const fields = jobBoard.data.content.fields as any;
          const jobIds = fields.jobs || [];

          // Check each job for user's applications
          const applicationPromises = jobIds.map(async (jobId: string) => {
            try {
              // Try to get the dynamic object field for this user's address
              const dynamicFieldName = {
                type: "address",
                value: account.address,
              };

              const dynamicField = await suiClient.getDynamicFieldObject({
                parentId: jobId,
                name: dynamicFieldName,
              });

              if (dynamicField.data?.content?.dataType === "moveObject") {
                const appFields = dynamicField.data.content.fields as any;

                // Get job details
                const jobObject = await suiClient.getObject({
                  id: jobId,
                  options: { showContent: true },
                });

                if (jobObject.data?.content?.dataType === "moveObject") {
                  const jobFields = jobObject.data.content.fields as any;

                  return {
                    id: dynamicField.data.objectId,
                    job_id: jobId,
                    jobTitle: jobFields.name || "",
                    company: jobFields.company || "",
                    location: jobFields.location || "",
                    category: jobFields.category || "",
                    applicant: appFields.applicant || "",
                    resume_link: appFields.resume_link || "",
                    cover_letter: appFields.cover_letter || "",
                    applied_at: Date.now(),
                  } as Application;
                }
              }
            } catch (error) {
              // User hasn't applied to this job, skip
              return null;
            }
            return null;
          });

          const fetchedApplications = (await Promise.all(applicationPromises)).filter(
            (app): app is Application => app !== null
          );

          setApplications(fetchedApplications);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [account?.address, suiClient]);
  return (
    <Flex direction="column" gap="6">
      
      {/* --- HEADER & STATS --- */}
      <Flex justify="between" align="end" wrap="wrap" gap="4">
        <Box>
            <Heading size="8" mb="2">Dashboard</Heading>
            <Text color="gray" size="4">
              {!account?.address 
                ? "Connect your wallet to view your applications" 
                : "Track your applications and their progress."}
            </Text>
        </Box>
        
        {/* Statistics Cards */}
        {account?.address && (
          <Flex gap="4">
              <Card>
                  <Flex direction="column" align="center" px="2">
                      <Text size="6" weight="bold" color="iris">{applications.length}</Text>
                      <Text size="1" color="gray">Applications</Text>
                  </Flex>
              </Card>
              <Card>
                  <Flex direction="column" align="center" px="2">
                      <Text size="6" weight="bold" color="green">
                        {applications.filter(app => app.applied_at).length}
                      </Text>
                      <Text size="1" color="gray">Submitted</Text>
                  </Flex>
              </Card>
          </Flex>
        )}
      </Flex>

      <Separator size="4" />

      {/* --- APPLICATIONS LIST --- */}
      <Box>
        <Heading size="4" mb="4" color="gray">My Applications</Heading>
        
        {!account?.address ? (
          <Card size="3">
            <Text size="3" color="gray" align="center">
              Please connect your wallet to view your applications
            </Text>
          </Card>
        ) : isLoading ? (
          <Text size="3" color="gray">Loading your applications...</Text>
        ) : applications.length === 0 ? (
          <Card size="3">
            <Text size="3" color="gray" align="center">
              You haven't applied to any jobs yet. Visit the Jobs page to start applying!
            </Text>
          </Card>
        ) : (
          <Grid columns="1" gap="4">
            {applications.map((app) => {
              const statusConfig = getStatusConfig(null); // For now, all are pending
              
              return (
                <Card 
                  key={app.id} 
                  size="2" 
                  style={{ transition: "0.2s all", cursor: "pointer" }}
                  onClick={() => navigate(`/job/${app.job_id}`)}
                >
                  <Flex gap="4" align="center">
                    
                    {/* Logo Section */}
                    <Avatar 
                      size="5" 
                      fallback={app.company.charAt(0).toUpperCase()} 
                      color="iris" 
                      variant="soft" 
                      radius="full"
                    />

                    {/* Content Section */}
                    <Box style={{ flex: 1 }}>
                      <Flex justify="between" align="start" mb="1">
                        <Heading size="4">{app.jobTitle}</Heading>
                        {/* Status Badge */}
                        <Badge color={statusConfig.color as any} size="2" variant="soft">
                          <Flex gap="1" align="center">
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Flex>
                        </Badge>
                      </Flex>

                      <Text size="2" weight="medium" color="gray">{app.company}</Text>
                      
                      {/* Detail Information */}
                      <Grid columns={{ initial: "1", sm: "3" }} gap="2" mt="3">
                        <Flex gap="2" align="center">
                          <GlobeIcon color="gray" />
                          <Text size="2" color="gray">{app.location}</Text>
                        </Flex>
                        <Flex gap="2" align="center">
                          <LaptopIcon color="gray" />
                          <Text size="2" color="gray">{app.category}</Text>
                        </Flex>
                        <Flex gap="2" align="center">
                          <ClockIcon color="gray" />
                          <Text size="2" color="gray">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </Text>
                        </Flex>
                      </Grid>
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
