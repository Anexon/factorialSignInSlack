import slack from "slack";

export const postWelcome =
    (myChannel: string, myText: string, displayName: string, userImage: string) => {
        return slack.chat.postMessage({
            token: process.env.slack_app_token,
            channel: myChannel,
            text: myText,
            as_user: false,
            username: displayName,
            icon_url: userImage});
    };

export async function getUserEmail(userIdentifier: string) {
    const res = await slack.users.profile.get({
        token: process.env.slack_app_token,
        user: userIdentifier
    });
    return res.profile.email;
}

export async function getUserInfo(userIdentifier: string) {
    const params = await slack.users.info({
        token: process.env.slack_app_token,
        user: userIdentifier
    });

    return {
        userTimeZone: params.user.tz_offset,
        userDisplayName: params.user.profile.display_name,
        userImage: params.user.profile.image_48
    };
}
