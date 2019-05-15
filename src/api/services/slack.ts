import slack from "slack";

export const postWelcome =
    (myChannel: string, myText: string) => {
        return slack.chat.postMessage({
            token: process.env.slack_app_token, 
            channel: myChannel, 
            text: myText,
            as_user: true});
    };

export async function getUserEmail(userIdentifier: string) {
    const res = await slack.users.profile.get({
        token: process.env.slack_app_token,
        user: userIdentifier
    });
    return res.profile.email;
}

export async function getUserTimeZone(userIdentifier: string) {
    const params = await slack.users.info({
        token: process.env.slack_app_token,
        user: userIdentifier
    })
    return params.user.tz_offset;
}
