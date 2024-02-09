import React, { useContext } from "react";
import prettyBytes from "pretty-bytes";
import { userContext } from "../../../utils/context";

function UserDetailsSection() {
  const { user } = useContext(userContext);

  const freeSpace = user?.allocatedSpace - user?.usedSpace;

  const date = new Date(user?.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="user-details-section">
      <div className="image"></div>
      <p>{user?.name}</p>
      <p>
        {user?.email}
        <span style={{ color: "green", fontSize: ".6rem", fontWeight: "700" }}>
          {user.isVerified ? "(verified)" : "(not verified)"}
        </span>
      </p>
      <p>Joined on {date}</p>

      <div className="space-details">
        <div className="allocated">
          <div className="bar"></div>
          <p className="allocated-space">
            Total Space:
            {user?._id &&
              prettyBytes(user?.allocatedSpace, {
                space: false,
                maximumFractionDigits: 0,
              })}
          </p>
        </div>
        <div className="used">
          <div className="bar"></div>
          <p className="used-space">
            Used Space:
            {user?._id &&
              prettyBytes(user?.usedSpace, {
                space: false,
                maximumFractionDigits: 0,
              })}
          </p>
        </div>
        <div className="free">
          <div className="bar"></div>
          <p className="free-space">
            Free Space:
            {user?._id &&
              prettyBytes(freeSpace, {
                space: false,
                maximumFractionDigits: 0,
              })}
          </p>
        </div>
      </div>
      {/* {isChangingPassword && (
        <ChangePassword setIsChangingPassword={setIsChangingPassword} />
      )}
      {isDeletingAcc && <DeleteAccount setIsDeletingAcc={setIsDeletingAcc} />} */}
    </section>
  );
}

export default UserDetailsSection;
