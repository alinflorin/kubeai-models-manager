import {
  Box,
  Typography,
  Button,
  Card,
  Avatar,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";

export default function HomeAdvancedDark() {
  const features = [
    {
      title: "Start AI Chat",
      description: "Interact with AI instantly and explore smart responses.",
      icon: <ChatIcon fontSize="large" sx={{ color: "#90caf9" }} />,
    },
    {
      title: "Organize Your Chats",
      description: "Rename, archive, delete or share your conversations easily.",
      icon: <FolderIcon fontSize="large" sx={{ color: "#f48fb1" }} />,
    },
    {
      title: "Personalize Settings",
      description: "Customize notifications, appearance, and personal preferences.",
      icon: <SettingsIcon fontSize="large" sx={{ color: "#a5d6a7" }} />,
    },
    {
      title: "Collaborate & Share",
      description: "Share your chats with friends or export your data securely.",
      icon: <PeopleIcon fontSize="large" sx={{ color: "#ffcc80" }} />,
    },
  ];

  return (
    <Box 
      sx={{ 
        width: "100%", 
        minHeight: "100vh", 
        bgcolor: "#121212", 
        // Reduced padding on mobile (xs)
        p: { xs: 2, sm: 4 }, 
        color: "white" 
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 2,
          mb: 6,
        }}
      >
        <Typography 
          // Set a default variant (e.g., h2)
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            // Use sx to responsively override the fontSize
            fontSize: { 
              xs: '2.25rem', // h4 equivalent size
              sm: '3rem',    // h3 equivalent size
              md: '3.75rem', // h2 equivalent size
            }
          }}
        >
          Welcome to MyChat AI
        </Typography>
        <Typography 
          variant="h6" // Set a default variant
          sx={{ mb: 4, color: "#b0b0b0", fontSize: { xs: '1rem', sm: '1.25rem' } }} // Adjust size for mobile
        >
          Smart conversations, easy management, and full control of your chats.
        </Typography>
        <Button
          variant="contained"
          size="large"
          // Adjusted button margins for mobile stacking
          sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 }, bgcolor: "#90caf9", color: "#121212", "&:hover": { bgcolor: "#64b5f6" } }} 
        >
          Start a Chat
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ color: "white", borderColor: "white", "&:hover": { borderColor: "#90caf9", color: "#90caf9" } }}
        >
          Explore Features
        </Button>
      </Box>

      {/* --- */}
      
      {/* Features Section (No changes needed, already responsive) */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 2, sm: 4 }, 
          justifyContent: "center",
          mb: 6,
        }}
      >
        {features.map((f, i) => (
          <Card
            key={i}
            sx={{
              width: { xs: "100%", sm: "45%", md: "30%" },
              p: 3,
              borderRadius: 3,
              textAlign: "center",
              backgroundColor: "#1e1e1e",
              boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": { transform: "translateY(-10px)", boxShadow: "0 8px 20px rgba(0,0,0,0.7)" },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#2a2a2a",
                width: 56,
                height: 56,
                mx: "auto",
                mb: 2,
              }}
            >
              {f.icon}
            </Avatar>
            <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
              {f.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
              {f.description}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* --- */}

      {/* Mock Chat Preview and CTA (No changes needed, already responsive) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, 
          alignItems: "center",
          gap: 4,
          justifyContent: "center",
        }}
      >
        <Card
          sx={{
            flex: 1,
            maxWidth: { xs: "100%", sm: 400 }, 
            p: 3,
            borderRadius: 3,
            bgcolor: "#1e1e1e",
            boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
            color: "white",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Sample Chat
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ alignSelf: "flex-start", bgcolor: "#2a2a2a", p: 1.5, borderRadius: 2, maxWidth: "80%" }}>
              <Typography variant="body2">Hello! How can I help you today?</Typography>
            </Box>
            <Box sx={{ alignSelf: "flex-end", bgcolor: "#90caf9", color: "#121212", p: 1.5, borderRadius: 2, maxWidth: "80%" }}>
              <Typography variant="body2">I want to explore AI chats.</Typography>
            </Box>
            <Box sx={{ alignSelf: "flex-start", bgcolor: "#2a2a2a", p: 1.5, borderRadius: 2, maxWidth: "80%" }}>
              <Typography variant="body2">Great! Let's start with some examples.</Typography>
            </Box>
          </Box>
        </Card>

        {/* CTA Box */}
        <Box
          sx={{
            flex: 1,
            width: { xs: "100%", md: "auto" },
            textAlign: "center",
            p: 4,
            bgcolor: "#2a2a2a",
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Ready to get started?
          </Typography>
          <Button variant="contained" size="large" sx={{ bgcolor: "#90caf9", color: "#121212", "&:hover": { bgcolor: "#64b5f6" } }}>
            Start a Chat
          </Button>
        </Box>
      </Box>
    </Box>
  );
}