import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  render,
} from '@react-email/components';
import * as React from 'react';

interface PsicoreinventarDoctorRegisterEmailProps {
  doctorName?: string;
  registerDoctorLink?: string;
}

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';

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
          <Img
            src={`https://res.cloudinary.com/dzgjxwvnw/image/upload/v1720212860/psicoreinventar/wnhx96f5n7ptqxacj2qq.png`}
            width='42'
            height='42'
            alt='Psicoreinventar Logo'
          />
          <Section>
            <Heading style={h1}>Welcome to the Psicoreinventar Team!</Heading>
            <Text style={text}>Dear Dr. {doctorName},</Text>
            <Text style={text}>
              We are thrilled to inform you that you have been selected to join the Psicoreinventar
              team as our newest mental health professional. Your expertise and dedication stood out
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

            <Text style={text}>All the best, </Text>
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
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
};

const text = {
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '15px',
};

const button = {
  backgroundColor: '#0F172A',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
};

const anchor = {
  textDecoration: 'underline',
};
