import { Box, Card, Flex, Grid, Heading, Text, Badge, Avatar, Separator } from "@radix-ui/themes";
import { 
  CheckCircledIcon, 
  ClockIcon, 
  EyeOpenIcon, 
  LaptopIcon, 
  CrossCircledIcon,
  PaperPlaneIcon,
  GlobeIcon
} from "@radix-ui/react-icons";

// --- MOCK DATA ---
const MY_APPLICATIONS = [
  {
    id: "1",
    jobTitle: "Senior Move Developer",
    company: "Mysten Labs",
    location: "Remote",
    type: "Full-time",
    appliedAt: "2 days ago",
    status: "Viewed",
    logo: "M"
  },
  {
    id: "2",
    jobTitle: "Frontend Developer (React)",
    company: "Sui Turkey Community",
    location: "Ankara, Turkey",
    type: "On-site",
    appliedAt: "5 days ago",
    status: "Interview",
    logo: "S"
  },
  {
    id: "3",
    jobTitle: "Smart Contract Auditor",
    company: "OtterSec",
    location: "Remote",
    type: "Contract",
    appliedAt: "1 week ago",
    status: "Applied",
    logo: "O"
  },
  {
    id: "4",
    jobTitle: "Product Designer",
    company: "Trendyol Tech",
    location: "Istanbul (Maslak)",
    type: "Hybrid",
    appliedAt: "2 weeks ago",
    status: "Rejected",
    logo: "T"
  },
  {
    id: "5",
    jobTitle: "Rust Backend Engineer",
    company: "BlueMove NFT",
    location: "Remote",
    type: "Full-time",
    appliedAt: "3 weeks ago",
    status: "Offer",
    logo: "B"
  }
];

// Status Color and Icon Helper
const getStatusConfig = (status: string) => {
  switch (status) {
    case "Viewed":
      return { color: "blue", icon: <EyeOpenIcon />, label: "Viewed" };
    case "Interview":
      return { color: "amber", icon: <ClockIcon />, label: "Interview Stage" };
    case "Offer":
      return { color: "green", icon: <CheckCircledIcon />, label: "Offer Received" };
    case "Rejected":
      return { color: "red", icon: <CrossCircledIcon />, label: "Not Selected" };
    default: // Applied
      return { color: "gray", icon: <PaperPlaneIcon />, label: "Applied" };
  }
};

export default function DashboardPage() {
  return (
    <Flex direction="column" gap="6">
      
      {/* --- HEADER & STATS --- */}
      <Flex justify="between" align="end" wrap="wrap" gap="4">
        <Box>
            <Heading size="8" mb="2">Dashboard</Heading>
            <Text color="gray" size="4">Track your applications and their progress.</Text>
        </Box>
        
        {/* Statistics Cards */}
        <Flex gap="4">
            <Card>
                <Flex direction="column" align="center" px="2">
                    <Text size="6" weight="bold" color="iris">5</Text>
                    <Text size="1" color="gray">Applications</Text>
                </Flex>
            </Card>
            <Card>
                <Flex direction="column" align="center" px="2">
                    <Text size="6" weight="bold" color="amber">1</Text>
                    <Text size="1" color="gray">Interviews</Text>
                </Flex>
            </Card>
        </Flex>
      </Flex>

      <Separator size="4" />

      {/* --- APPLICATIONS LIST --- */}
      <Box>
        <Heading size="4" mb="4" color="gray">My Recent Applications</Heading>
        
        <Grid columns="1" gap="4">
            {MY_APPLICATIONS.map((app) => {
                const statusConfig = getStatusConfig(app.status);
                
                return (
                    <Card key={app.id} size="2" style={{ transition: "0.2s all", cursor: "pointer" }}>
                        <Flex gap="4" align="center">
                            
                            {/* Logo Section */}
                            <Avatar 
                                size="5" 
                                fallback={app.logo} 
                                color="gray" 
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
                                        <Text size="2" color="gray">{app.type}</Text>
                                    </Flex>
                                    <Flex gap="2" align="center">
                                        <ClockIcon color="gray" />
                                        <Text size="2" color="gray">{app.appliedAt}</Text>
                                    </Flex>
                                </Grid>
                            </Box>
                        </Flex>
                    </Card>
                );
            })}
        </Grid>
      </Box>
    </Flex>
  );
}
