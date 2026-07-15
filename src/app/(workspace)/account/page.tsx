import { Sidebar } from "@/components/explorer/Sidebar";
import { AccountHeader } from "@/components/account/AccountHeader";
import { IdentityCard } from "@/components/account/IdentityCard";
import { PersonalInfoCard } from "@/components/account/PersonalInfoCard";
import { SecurityCard } from "@/components/account/SecurityCard";
import { PreferencesCard } from "@/components/account/PreferencesCard";
import { RolesCard } from "@/components/account/RolesCard";

const AccountPage = () => {
  return (
    <div className="flex h-full animate-fade">
      <Sidebar active="account" />

      <div className="flex min-w-0 flex-1 flex-col">
        <AccountHeader />

        <div className="flex-1 overflow-y-auto p-[26px_30px_44px]">
          <IdentityCard />

          <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
            <PersonalInfoCard />
            <div className="flex flex-col gap-4">
              <SecurityCard />
              <PreferencesCard />
            </div>
          </div>

          <div className="mt-4">
            <RolesCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
