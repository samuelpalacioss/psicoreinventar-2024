import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  render,
} from '@react-email/components';
import * as React from 'react';

interface PsicoreinventarResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

export default function PsicoreinventarResetPasswordEmail({
  userFirstname,
  resetPasswordLink,
}: PsicoreinventarResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Psicoreinventar reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`https://res.cloudinary.com/dzgjxwvnw/image/upload/v1720212860/psicoreinventar/wnhx96f5n7ptqxacj2qq.png`}
            width='42'
            height='42'
            alt='Psicoreinventar Logo'
          />
          <Section>
            <Text style={text}>Hi {userFirstname},</Text>
            {/* <Text style={text}>
              Someone recently requested a password change for your Psicoreinventar account. If this
              was you, you can set a new password here:
            </Text> */}
            <Text style={text}>
              Recently, a password change was requested for your Psicoreinventar account. If this
              was you, you can set a new password here:
            </Text>
            <Button style={button} href={resetPasswordLink}>
              Reset password
            </Button>
            <Text style={text}>This link will expire in one hour.</Text>
            <Text style={text}>
              If you don't want to change your password or didn't request this, just
              ignore and feel free to delete this message.
            </Text>
            <Text style={text}>All the best, </Text>
            <Text style={text}>The Psicoreinventar team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const PsicoreinventarResetPasswordEmailHtml = (
  props: PsicoreinventarResetPasswordEmailProps
) =>
  render(<PsicoreinventarResetPasswordEmail {...props} />, {
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
