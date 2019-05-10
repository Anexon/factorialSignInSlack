import slack from "slack";

export const postWelcome =
    (channel: string, text: string) => {
        return slack.chat.postMessage({token: process.env.slack_app_token, channel, text});
    };

export async function getUserEmail(userIdentifier: string) {
    const res = await slack.users.profile.get({
        token: process.env.slack_app_token,
        user: userIdentifier
    });
    return res.profile.email;
}
