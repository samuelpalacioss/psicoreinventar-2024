import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  render,
  Section,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  userFirstname: string;
  verificationLink: string;
}

export default function VerificationEmail({
  userFirstname,
  verificationLink,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Accent line at top */}
          <div style={accentBar} />

          <Section style={contentSection}>
            {/* Wordmark */}
            <Text style={wordmark}>psicoreinventar</Text>

            <Text style={heading}>Hi {userFirstname},</Text>

            <Text style={paragraph}>
              Thanks for joining. Please verify your email address to complete
              your account setup and begin your journey.
            </Text>

            <Section style={btnContainer}>
              <Button href={verificationLink} style={button}>
                Verify email address
              </Button>
            </Section>

            <Text style={smallText}>
              This link expires in 12 hours. If you didn&apos;t create an
              account, you can safely ignore this email.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            The Psicoreinventar Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const VerificationEmailHtml = (props: VerificationEmailProps) =>
  render(<VerificationEmail {...props} />, {
    pretty: true,
  });

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "40px auto",
  maxWidth: "500px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden" as const,
};

const accentBar = {
  height: "3px",
  backgroundColor: "#c4b5fd",
  width: "100%",
};

const contentSection = {
  padding: "36px 40px 28px",
};

const wordmark = {
  fontSize: "13px",
  fontWeight: "400",
  letterSpacing: "0.08em",
  color: "#9ca3af",
  textTransform: "uppercase" as const,
  marginBottom: "32px",
};

const heading = {
  fontSize: "26px",
  fontWeight: "500",
  color: "#1f2937",
  lineHeight: "1.2",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#6b7280",
  fontWeight: "400",
  margin: "0 0 32px",
};

const btnContainer = {
  marginBottom: "28px",
};

const button = {
  backgroundColor: "#7c3aed",
  color: "#ffffff",
  padding: "12px 28px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "500",
  letterSpacing: "0.02em",
};

const smallText = {
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#9ca3af",
  fontWeight: "400",
  margin: "0",
};

const hr = {
  borderColor: "#f3f4f6",
  margin: "0",
};

const footer = {
  fontSize: "13px",
  color: "#9ca3af",
  fontWeight: "400",
  padding: "20px 40px",
  margin: "0",
};
