import { useNavigate } from "react-router-dom";
import { Box, Button, Card, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { RocketIcon, LockClosedIcon, LightningBoltIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import suiLogo from "../assets/sui_white.png";
import joboMascot from "../assets/jobo.jpg";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box style={{ backgroundColor: "var(--gray-1)" }}>
      {/* --- HERO SECTION --- */}
      <Box 
        style={{ 
          background: "linear-gradient(135deg, #4DA2FF 0%, #2D5F99 100%)", 
          padding: "140px 0 120px 0",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background Pattern */}
        <Box style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "30px 30px"
        }} />

        <Container size="3" style={{ position: "relative" }}>
          <Grid columns={{ initial: "1", md: "2" }} gap="8" align="center">
            
            {/* Left Side - Text Content */}
            <Flex direction="column" gap="6">
              
              {/* Powered by Sui Badge */}
              <Flex align="center" gap="2" style={{ 
                background: "rgba(255,255,255,0.15)", 
                padding: "10px 20px", 
                borderRadius: "99px",
                backdropFilter: "blur(10px)",
                width: "fit-content"
              }}>
                <img src={suiLogo} alt="Sui" style={{ width: "20px", height: "25px" }} />
                <Text size="2" weight="medium" style={{ color: "white" }}>Powered by Sui Network</Text>
              </Flex>

              <Box>
                <Heading size="9" weight="bold" style={{ lineHeight: "1.1", color: "white" }}>
                  The Future of Hiring <br />
                  is <Text style={{ color: "#6FBCFF" }}>On-Chain</Text>
                </Heading>
                
                <Text size="5" style={{ color: "rgba(255,255,255,0.9)", lineHeight: "1.6", marginTop: "20px" }}>
                  Connect with top Web3 talent through blockchain-powered job listings. 
                  Post jobs, review applications, and hire with complete transparency on Sui.
                </Text>
              </Box>

              <Flex gap="3">
                <Button 
                  size="4" 
                  variant="solid"
                  style={{ 
                    cursor: "pointer", 
                    fontWeight: "600", 
                    padding: "0 36px",
                    background: "white",
                    color: "#4DA2FF"
                  }}
                  onClick={() => navigate("/jobs")}
                >
                  <RocketIcon />
                  Explore Jobs
                </Button>
                <Button 
                  size="4" 
                  variant="soft"
                  style={{ 
                    cursor: "pointer", 
                    fontWeight: "600", 
                    padding: "0 36px",
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    backdropFilter: "blur(10px)"
                  }}
                  onClick={() => navigate("/create-job")}
                >
                  Post a Job
                </Button>
              </Flex>
            </Flex>

            {/* Right Side - Mascot */}
            <Flex justify="center" align="center" style={{ position: "relative" }}>
              <Box style={{
                position: "relative",
                width: "420px",
                height: "420px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {/* Animated Glow Ring */}
                <Box style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(111,188,255,0.4) 0%, transparent 70%)",
                  filter: "blur(60px)",
                  animation: "pulse 4s ease-in-out infinite"
                }} />
                
                {/* Outer Ring */}
                <Box style={{
                  position: "absolute",
                  width: "380px",
                  height: "380px",
                  borderRadius: "50%",
                  border: "2px solid rgba(111,188,255,0.3)",
                  animation: "rotate 20s linear infinite"
                }} />
                
                {/* Main Circle Container */}
                <Box style={{
                  position: "relative",
                  width: "350px",
                  height: "350px",
                  borderRadius: "50%",
                  background: "#fff",
                  border: "3px solid rgba(111,188,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  transition: "all 0.4s ease",
                  cursor: "pointer",
                  boxShadow: "0 20px 60px rgba(77,162,255,0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.borderColor = "rgba(111,188,255,0.7)";
                  e.currentTarget.style.boxShadow = "0 25px 80px rgba(77,162,255,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "rgba(111,188,255,0.4)";
                  e.currentTarget.style.boxShadow = "0 20px 60px rgba(77,162,255,0.3)";
                }}
                >
                  {/* Mascot Image */}
                  <img 
                    src={joboMascot} 
                    alt="Jobo - Your AI Job Assistant" 
                    style={{ 
                      width: "90%", 
                      height: "90%", 
                      objectFit: "contain",
                      position: "relative",
                      zIndex: 1,
                      filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.2))"
                    }} 
                  />
                </Box>
              </Box>
            </Flex>

          </Grid>
        </Container>
      </Box>

      {/* --- FEATURES SECTION --- */}
      <Box py="9" style={{ backgroundColor: "var(--gray-1)" }}>
        <Container size="3">
          <Flex direction="column" align="center" mb="8">
            <Heading size="7" mb="3" style={{ color: "var(--gray-12)" }}>Why Choose Sui Jobster?</Heading>
            <Text color="gray" size="4" style={{ maxWidth: "600px", textAlign: "center" }}>
              Experience the next generation of hiring powered by Sui blockchain technology
            </Text>
          </Flex>

          <Grid columns={{ initial: "1", md: "3" }} gap="5" width="auto">
            
            {/* Feature 1 */}
            <Card 
              size="3" 
              style={{ 
                padding: "32px",
                background: "var(--color-panel-solid)",
                border: "1px solid var(--gray-6)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease"
              }}
            >
              <Flex gap="4" align="start" direction="column">
                <Box style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4DA2FF 0%, #6FBCFF 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <LockClosedIcon width="28" height="28" color="white" />
                </Box>
                <Box>
                  <Heading size="5" mb="2">True Ownership</Heading>
                  <Text as="p" size="3" style={{ lineHeight: "1.6", color: "var(--gray-11)" }}>
                    Every job post and application is a unique on-chain object on Sui. 
                    You own your data with complete transparency and security.
                  </Text>
                </Box>
              </Flex>
            </Card>

            {/* Feature 2 */}
            <Card 
              size="3" 
              style={{ 
                padding: "32px",
                background: "var(--color-panel-solid)",
                border: "1px solid var(--gray-6)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease"
              }}
            >
              <Flex gap="4" align="start" direction="column">
                <Box style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4DA2FF 0%, #6FBCFF 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <LightningBoltIcon width="28" height="28" color="white" />
                </Box>
                <Box>
                  <Heading size="5" mb="2">Lightning Fast</Heading>
                  <Text as="p" size="3" style={{ lineHeight: "1.6", color: "var(--gray-11)" }}>
                    Experience the blazing speed of Sui. Process applications and 
                    payments instantly with near-zero gas fees.
                  </Text>
                </Box>
              </Flex>
            </Card>

            {/* Feature 3 */}
            <Card 
              size="3" 
              style={{ 
                padding: "32px",
                background: "var(--color-panel-solid)",
                border: "1px solid var(--gray-6)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease"
              }}
            >
              <Flex gap="4" align="start" direction="column">
                <Box style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4DA2FF 0%, #6FBCFF 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <CheckCircledIcon width="28" height="28" color="white" />
                </Box>
                <Box>
                  <Heading size="5" mb="2">Verified Profiles</Heading>
                  <Text as="p" size="3" style={{ lineHeight: "1.6", color: "var(--gray-11)" }}>
                    Employer reputation and candidate history are verifiable on-chain, 
                    creating a trustless and transparent hiring environment.
                  </Text>
                </Box>
              </Flex>
            </Card>

          </Grid>
        </Container>
      </Box>

      {/* --- STATS SECTION --- */}
      <Box py="9" style={{ background: "linear-gradient(135deg, #4DA2FF 0%, #2D5F99 100%)" }}>
        <Container size="3">
          <Grid columns={{ initial: "1", sm: "3" }} gap="6">
            <Flex direction="column" align="center" gap="2">
              <Heading size="8" style={{ color: "white" }}>1,000+</Heading>
              <Text size="4" style={{ color: "rgba(255,255,255,0.8)" }}>Active Jobs</Text>
            </Flex>
            <Flex direction="column" align="center" gap="2">
              <Heading size="8" style={{ color: "white" }}>5,000+</Heading>
              <Text size="4" style={{ color: "rgba(255,255,255,0.8)" }}>Web3 Professionals</Text>
            </Flex>
            <Flex direction="column" align="center" gap="2">
              <Heading size="8" style={{ color: "white" }}>500+</Heading>
              <Text size="4" style={{ color: "rgba(255,255,255,0.8)" }}>Companies Hiring</Text>
            </Flex>
          </Grid>
        </Container>
      </Box>

      {/* --- JOBO ASSISTANT SECTION --- */}
      <Box py="9" style={{ backgroundColor: "var(--gray-1)" }}>
        <Container size="3">
          <Grid columns={{ initial: "1", md: "2" }} gap="8" align="center">
            
            {/* Mascot Image */}
            <Flex justify="center" align="center">
              <Box style={{
                position: "relative",
                width: "380px",
                height: "380px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {/* Animated Background */}
                <Box style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(77,162,255,0.2) 0%, transparent 70%)",
                  filter: "blur(40px)"
                }} />
                
                {/* Main Circle */}
                <Box style={{
                  position: "relative",
                  width: "350px",
                  height: "350px",
                  borderRadius: "50%",
                  background: "#fff",
                  border: "3px solid rgba(111,188,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  transition: "all 0.4s ease",
                  cursor: "pointer",
                  boxShadow: "0 15px 50px rgba(77,162,255,0.25)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05) rotate(5deg)";
                  e.currentTarget.style.borderColor = "rgba(111,188,255,0.6)";
                  e.currentTarget.style.boxShadow = "0 20px 70px rgba(77,162,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                  e.currentTarget.style.borderColor = "rgba(111,188,255,0.3)";
                  e.currentTarget.style.boxShadow = "0 15px 50px rgba(77,162,255,0.25)";
                }}
                >
                  <img 
                    src={joboMascot} 
                    alt="Jobo - Your AI Job Assistant" 
                    style={{ 
                      width: "85%", 
                      height: "85%", 
                      objectFit: "contain",
                      position: "relative",
                      zIndex: 1
                    }} 
                  />
                </Box>
              </Box>
            </Flex>

            {/* Content */}
            <Flex direction="column" gap="4">
              <Box>
                <Heading size="7" mb="3">
                  Meet <Text style={{ color: "#4DA2FF" }}>Jobo</Text> - Your AI Job Assistant
                </Heading>
                <Text size="4" color="gray" style={{ lineHeight: "1.7" }}>
                  Jobo is your friendly AI-powered assistant that helps you navigate the job market. 
                  Get personalized job recommendations, career advice, and instant support throughout your journey.
                </Text>
              </Box>

              <Flex direction="column" gap="3" mt="2">
                <Flex gap="3" align="start">
                  <Box style={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #4DA2FF 0%, #6FBCFF 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <RocketIcon width="20" height="20" color="white" />
                  </Box>
                  <Box>
                    <Heading size="4" mb="1">Smart Job Matching</Heading>
                    <Text size="3" color="gray">AI-powered recommendations based on your skills and preferences</Text>
                  </Box>
                </Flex>

                <Flex gap="3" align="start">
                  <Box style={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #4DA2FF 0%, #6FBCFF 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <LightningBoltIcon width="20" height="20" color="white" />
                  </Box>
                  <Box>
                    <Heading size="4" mb="1">Instant Assistance</Heading>
                    <Text size="3" color="gray">Get answers to your questions 24/7 with our AI chatbot</Text>
                  </Box>
                </Flex>

                <Flex gap="3" align="start">
                  <Box style={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #4DA2FF 0%, #6FBCFF 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <CheckCircledIcon width="20" height="20" color="white" />
                  </Box>
                  <Box>
                    <Heading size="4" mb="1">Career Guidance</Heading>
                    <Text size="3" color="gray">Receive personalized advice to advance your Web3 career</Text>
                  </Box>
                </Flex>
              </Flex>

              <Button 
                size="3" 
                style={{ 
                  cursor: "pointer", 
                  fontWeight: "600", 
                  width: "fit-content",
                  background: "linear-gradient(135deg, #4DA2FF 0%, #6FBCFF 100%)",
                  color: "white",
                  border: "none"
                }}
                onClick={() => navigate("/find-best-job")}
              >
                Try Jobo Now
              </Button>
            </Flex>

          </Grid>
        </Container>
      </Box>

      {/* --- FOOTER --- */}
      <Box py="8" style={{ borderTop: "1px solid var(--gray-4)", backgroundColor: "var(--gray-2)" }}>
        <Container size="3">
          <Grid columns={{ initial: "1", md: "4" }} gap="6" mb="6">
            {/* Brand */}
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <img src={suiLogo} alt="Sui" style={{ width: "28px", height: "36px" }} />
                <Heading size="5" style={{ color: "var(--gray-12)" }}>Sui Jobster</Heading>
              </Flex>
              <Text size="2" color="gray" style={{ lineHeight: "1.6" }}>
                The decentralized job marketplace powered by Sui blockchain.
              </Text>
            </Flex>

            {/* Product */}
            <Flex direction="column" gap="3">
              <Heading size="4" style={{ color: "var(--gray-12)" }}>Product</Heading>
              <Flex direction="column" gap="2">
                <Text size="2" style={{ cursor: "pointer", color: "var(--gray-11)" }} onClick={() => navigate("/jobs")}>
                  Browse Jobs
                </Text>
                <Text size="2" style={{ cursor: "pointer", color: "var(--gray-11)" }} onClick={() => navigate("/create-job")}>
                  Post a Job
                </Text>
                <Text size="2" style={{ cursor: "pointer", color: "var(--gray-11)" }} onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Text>
              </Flex>
            </Flex>

            {/* Resources */}
            <Flex direction="column" gap="3">
              <Heading size="4" style={{ color: "var(--gray-12)" }}>Resources</Heading>
              <Flex direction="column" gap="2">
                <Text size="2" color="gray">Documentation</Text>
                <Text size="2" color="gray">API Reference</Text>
                <Text size="2" color="gray">Smart Contracts</Text>
              </Flex>
            </Flex>

            {/* Company */}
            <Flex direction="column" gap="3">
              <Heading size="4" style={{ color: "var(--gray-12)" }}>Company</Heading>
              <Flex direction="column" gap="2">
                <Text size="2" color="gray">About Us</Text>
                <Text size="2" color="gray">Privacy Policy</Text>
                <Text size="2" color="gray">Terms of Service</Text>
              </Flex>
            </Flex>
          </Grid>

          <Box pt="6" style={{ borderTop: "1px solid var(--gray-4)" }}>
            <Flex justify="between" align="center" direction={{ initial: "column", sm: "row" }} gap="3">
              <Text size="2" color="gray">
                © 2025 Sui Lobster. All rights reserved.
              </Text>
              <Flex align="center" gap="2">
                <Text size="2" color="gray">Powered by</Text>
                <img src={suiLogo} alt="Sui" style={{ width: "8px", height: "24px" }} />
                <Text size="2" weight="medium" style={{ color: "#4DA2FF" }}>Sui Network</Text>
              </Flex>
            </Flex>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}