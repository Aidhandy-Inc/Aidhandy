"use client";
<<<<<<< HEAD:app/dashboard/profile/page.js
import CompanionProfilePage from "@/components/Profile/CompanionProfile/CompanionProfile";
=======

export const dynamic = "force-dynamic";
export const revalidate = 0;
>>>>>>> 7e7636ed86f4c195ff16be12954dd4cb0435c4bc:nextapp/app/dashboard/profile/page.js
import TravellerSignUpPage from "@/components/Profile/traveller-signup/TravellerSignUpPage";
import { useUser } from "@/context/ClientProvider";
import LoadingState from "@/components/Profile/LoadingState";

export default function ProfilePage() {
  const userContext = useUser();
  const { user, profile } = userContext || { user: null, profile: null };

  if (!userContext) {
    return <LoadingState />;
  }

  return (
    <>
      {profile && profile?.type === "traveller" ? (
        <TravellerSignUpPage
          profile={profile}
          user={user}
          email={profile?.email}
        />
      ) : profile && profile?.type === "companion" ? (
<<<<<<< HEAD:app/dashboard/profile/page.js
        <>
          <CompanionProfilePage
            profile={profile}
            user={user}
            email={profile?.email}
          />
        </>
=======
        <></>
>>>>>>> 7e7636ed86f4c195ff16be12954dd4cb0435c4bc:nextapp/app/dashboard/profile/page.js
      ) : (
        ""
      )}
    </>
  );
}