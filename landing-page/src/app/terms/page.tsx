import type { Metadata } from "next";
import { ContactLine, LegalPage, LegalSection } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use · Remind",
  description: "The rules for using Remind.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="November 23, 2026">
      <LegalSection title="The service">
        <p>
          Remind places automated phone calls, voiced by an AI agent, to remind you of tasks you schedule. By creating
          an account you agree to these terms.
        </p>
      </LegalSection>

      <LegalSection title="Your phone number">
        <p>
          You may only register a phone number that belongs to you or that you are authorised to use, and you consent
          to receive automated reminder calls on it. Do not use Remind to call anyone who has not agreed to receive
          these calls.
        </p>
      </LegalSection>

      <LegalSection title="Not for emergencies or critical care">
        <p>
          Calls depend on phone networks and third-party services and can be delayed or fail. Do not rely on Remind for
          medical, safety-critical or emergency reminders.
        </p>
      </LegalSection>

      <LegalSection title="Fair use">
        <p>
          Trial and free accounts have limits on active reminders and daily calls. We may suspend accounts that abuse
          the service, attempt to call third parties, or try to disrupt it.
        </p>
      </LegalSection>

      <LegalSection title="Plans and changes">
        <p>
          Features and prices may change. We will show the current plan details in the app before you pay for anything.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          The service is provided as is. To the extent the law allows, we are not liable for losses caused by a missed,
          late or misunderstood reminder.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <ContactLine />
      </LegalSection>
    </LegalPage>
  );
}
