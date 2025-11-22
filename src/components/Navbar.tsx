import { ConnectButton } from "@mysten/dapp-kit";
import { Link, useLocation } from "react-router-dom";
import { Box, Flex, Heading, Button, TabNav, Text } from "@radix-ui/themes";
import joboMascot from "../assets/jobo.jpg";

export function Navbar() {
  const location = useLocation();

  return (
    <Box 
      px="5" 
      py="3" 
      style={{ 
        borderBottom: "1px solid var(--gray-a6)", 
        backgroundColor: "var(--color-panel-solid)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}
    >
      <Flex justify="between" align="center">
        
        {/* 1. Logo Alanı */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap="2">
            <Box
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--accent-9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <img 
                src={joboMascot} 
                alt="Jobo" 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover"
                }} 
              />
            </Box>
            <Heading as="h2" size="5" weight="bold" style={{ color: "var(--accent-11)" }}>
              Jobster
            </Heading>
          </Flex>
        </Link>

        {/* 2. Navigasyon Linkleri */}
        <Box display={{ initial: "none", sm: "block" }}>
          <TabNav.Root size="2">
            <TabNav.Link asChild active={location.pathname === '/dashboard'}>
              <Link to="/dashboard" style={{ 
                color: location.pathname === '/dashboard' ? "var(--accent-11)" : "var(--gray-11)", 
                fontWeight: location.pathname === '/dashboard' ? 600 : 500 
              }}>
                Dashboard
              </Link>
            </TabNav.Link>
            <TabNav.Link asChild active={location.pathname === '/jobs'}>
              <Link to="/jobs" style={{ 
                color: location.pathname === '/jobs' ? "var(--accent-11)" : "var(--gray-11)", 
                fontWeight: location.pathname === '/jobs' ? 600 : 500 
              }}>
                All Jobs
              </Link>
            </TabNav.Link>
            <TabNav.Link asChild active={location.pathname === '/review-applications'}>
              <Link to="/review-applications" style={{ 
                color: location.pathname === '/review-applications' ? "var(--accent-11)" : "var(--gray-11)", 
                fontWeight: location.pathname === '/review-applications' ? 600 : 500 
              }}>
                Review Applications
              </Link>
            </TabNav.Link>
          </TabNav.Root>
        </Box>

        {/* 3. Sağ Taraf Butonlar */}
        <Flex gap="4" align="center">
          <Link to="/create-job">
            <Button variant="solid" color="iris" highContrast size="2" style={{ cursor: 'pointer' }}>
              <Text weight="bold">+ Post Job</Text>
            </Button>
          </Link>
          
          {/* Sui Wallet Connect Button */}
          <ConnectButton />
        </Flex>
      </Flex>
    </Box>
  );
}