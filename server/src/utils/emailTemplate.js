export function staffInviteHtml(name, workspaceName, acceptUrl) {
  return `
    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
      <h2>Hello ${name || "there"},</h2>
      <p>You’ve been invited to join the workspace <strong>${workspaceName}</strong>.</p>
      <p>Click the button below to accept the invitation and set your password:</p>
      <p style="text-align: center;">
        <a href="${acceptUrl}"
          style="
            background-color: #0069ff;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
          ">
          Accept Invite
        </a>
      </p>
      <p>If the button doesn’t work, copy and paste this link in your browser:</p>
      <p>${acceptUrl}</p>
      <hr>
      <p>Regards,<br/>Your SaaS Team</p>
    </div>
  `;
}
