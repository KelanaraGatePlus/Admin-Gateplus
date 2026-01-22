export function storeUserData(data) {
    const { token, id, image, role, creator } = data;

    if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("theme", "dark");
        localStorage.setItem("users_id", id);
        localStorage.setItem("image_users", image);
        localStorage.setItem("role", role);

        if (creator !== null) {
            localStorage.setItem("image_creators", creator.imageUrl);
            localStorage.setItem("creators_id", creator.id);
            localStorage.setItem("isCreator", JSON.stringify(true));
        }

        // set cookie expires in 1 day
        const expires = new Date();
        expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
        document.cookie = `token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    } else {
        throw new Error("Token not found in response");
    }
}

export function getUserData() {
    const token = localStorage.getItem("token");
    const image_users = localStorage.getItem("image_users");
    const role = localStorage.getItem("role");
    const isCreator = JSON.parse(localStorage.getItem("isCreator") || "false");
    const creators_id = localStorage.getItem("creators_id");
    const image_creators = localStorage.getItem("image_creators");
    const users_id = localStorage.getItem("users_id");
    return { token, image_users, role, isCreator, creators_id, image_creators, users_id };
}

export function clearUserData() {
    const lastSeen = localStorage.getItem("last_seen_content");
    localStorage.clear();
    if (lastSeen) {
        localStorage.setItem("last_seen_content", lastSeen);
    }
    document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
}
