import type { Metadata } from "next";
import { ContactLine, LegalPage, LegalSection } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
  description: "What Remind collects, why, and who processes it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 23, 2026">
      <LegalSection title="What we collect">
        <p>
          Your name, email address, username, phone number, timezone and calling-hour preferences. The reminders you
          create: title, description, time and priority. For every call: when it rang, whether it was answered, how long
          it lasted, and a text transcript of the conversation.
        </p>
      </LegalSection>

      <LegalSection title="How calls work">
        <p>
          Reminder calls are made by an AI voice agent, not a person. What you say on the call is converted to text and
          processed by an AI model so the agent can understand requests like &ldquo;done&rdquo; or &ldquo;call me back
          in 30 minutes&rdquo;. The transcript is stored with your reminder so you can review it in your dashboard.
        </p>
      </LegalSection>

      <LegalSection title="Why we use it">
        <p>
          Only to deliver the service: to call you at the right time, act on what you ask during the call, show you
          your reminder history, and sign you in. We do not sell your data and we do not use it for advertising.
        </p>
      </LegalSection>

      <LegalSection title="Who processes it for us">
        <p>
          Voice AI and speech services (Vapi and the speech and language model providers it uses), our telephony
          carrier (Vobiz) to place the call, our database host (MongoDB Atlas), our email provider (Brevo) for sign-in
          codes, and our hosting providers. Each receives only what it needs to perform its part.
        </p>
      </LegalSection>

      <LegalSection title="Retention and deletion">
        <p>
          We keep your data while your account is active. You can cancel any reminder at any time. To delete your
          account and its reminders, call history and transcripts, contact us and we will remove them.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Passwords are hashed, sessions use secure http-only cookies, and our call webhooks are authenticated. No
          system is perfectly secure, so please use a strong password.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <ContactLine />
      </LegalSection>
    </LegalPage>
  );
}
