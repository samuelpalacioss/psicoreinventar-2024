import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  render,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

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
          {/* Logo */}
          <Img
            src={`https://res.cloudinary.com/dzgjxwvnw/image/upload/v1739836330/psicoreinventar/ptfldl7wwjzzlfko5cns.png`}
            width="56"
            height="56"
            alt="Psicoreinventar Logo"
            style={logo}
          />

          <Section style={welcomeSection}>
            {/*<Text style={badge}>Email Verification</Text>*/}

            <Text style={heading}>Hi {userFirstname}</Text>
          </Section>

          <Text style={paragraph}>
            Please click the button below to verify your Psicoreinventar account. Let&apos;s get
            started on your therapy journey.
          </Text>

          <Section style={btnContainer}>
            <Button href={verificationLink} style={button}>
              Verify email
            </Button>
          </Section>

          <Text style={smallText}>This verification link will expire in 12 hours.</Text>

          <Hr style={hr} />
          {/* Footer */}
          <Section style={footer}>
            <Text style={paragraph}>
              Best,
              <br />
              The Psicoreinventar Team
            </Text>
          </Section>
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
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "480px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};

const logo = {
  // margin: "0 auto",
  display: "block",
};

const welcomeSection = {
  // textAlign: "center" as const,
  marginTop: "24px",
};

const badge = {
  backgroundColor: "#f3f0ff",
  color: "#5F51E8",
  padding: "4px 12px",
  borderRadius: "9999px",
  fontSize: "14px",
  fontWeight: "500",
  display: "inline-block",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#323842",
  marginTop: "8px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4b5563",
  // textAlign: "center" as const,
};

const btnContainer = {
  // textAlign: "center" as const,
  marginTop: "24px",
};

const button = {
  backgroundColor: "#5e3bdb",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  // textAlign: "center" as const,
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "500",
};

const smallText = {
  fontSize: "14px",
  color: "#6b7280",
  // textAlign: "center" as const,
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0 0",
};

const footer = {
  fontSize: "12px",
};

const footerText = {
  color: "#9ca3af",
  // textAlign: "center" as const,
};
