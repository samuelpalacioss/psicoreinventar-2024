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

interface PsicoreinventarDoctorRegisterEmailProps {
  doctorName?: string;
  registerDoctorLink?: string;
}

export default function PsicoreinventarDoctorRegisterEmail({
  doctorName,
  registerDoctorLink,
}: PsicoreinventarDoctorRegisterEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <div style={accentBar} />

          <Section style={contentSection}>
            <Text style={wordmark}>psicoreinventar</Text>

            <Text style={heading}>Welcome to the team, Dr. {doctorName}.</Text>

            <Text style={paragraph}>
              We&apos;re thrilled to have you join Psicoreinventar as one of
              our psychologists. Your expertise stood out during our selection
              process, and we&apos;re confident you&apos;ll be an invaluable
              part of our community.
            </Text>

            <Text style={paragraph}>
              To get started, please complete your profile registration by
              clicking the button below.
            </Text>

            <Section style={btnContainer}>
              <Button href={registerDoctorLink} style={button}>
                Complete registration
              </Button>
            </Section>

            <Text style={smallText}>
              You have 7 days to complete your registration. After that,
              you&apos;ll need to request a new link. If you need any
              assistance, our onboarding team is here to help.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>The Psicoreinventar Team</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const PsicoreinventarDoctorRegisterEmailHtml = (
  props: PsicoreinventarDoctorRegisterEmailProps
) =>
  render(<PsicoreinventarDoctorRegisterEmail {...props} />, {
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
  margin: "0 0 20px",
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
