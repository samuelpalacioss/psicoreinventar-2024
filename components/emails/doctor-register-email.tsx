import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Hr,
  Img,
  Preview,
  Section,
  Text,
  render,
} from "@react-email/components";
import * as React from "react";

interface PsicoreinventarDoctorRegisterEmailProps {
  doctorName?: string;
  registerDoctorLink?: string;
}

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

export default function PsicoreinventarDoctorRegisterEmail({
  doctorName,
  registerDoctorLink,
}: PsicoreinventarDoctorRegisterEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the Psicoreinventar Team!</Preview>
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
            <Heading style={h1}>Welcome to the Psicoreinventar Team!</Heading>
            <Text style={text}>Dear Dr. {doctorName},</Text>
            <Text style={text}>
              We are thrilled to inform you that you have been selected to join our team at
              Psicoreinventar as one of our psychologists. Your expertise and dedication stood out
              during our selection process, and we are confident that you will be an invaluable
              addition to our community.
            </Text>
            <Text style={text}>
              To get started, please register your profile on our website. Simply click the button
              below to begin your journey with us.
            </Text>
            <Button style={button} href={registerDoctorLink}>
              Complete Your Registration
            </Button>
            <Text style={text}>
              You have 7 days to register. If you don&apos;t, you will need to request a new
              register link.
            </Text>
            <Text style={text}>
              If you have any questions or need assistance during the registration process, our
              onboarding team is here to help you every step of the way.
            </Text>

            {/* Footer */}
            <Hr style={hr} />
            <Text style={text}>All the best,</Text>
            <Text style={text}>The Psicoreinventar team</Text>
          </Section>
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
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "480px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};

const logo = {
  display: "block",
};

const welcomeSection = {
  marginTop: "24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4b5563",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#323842",
  marginTop: "8px",
};

const button = {
  backgroundColor: "#5e3bdb",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "500",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0 0",
};
