const username = document.getElementById("Username");
const password = document.getElementById("password");
const form = document.querySelector('form');


// TODO: need to send notification to user for invalid credentials.


form.addEventListener('submit', async (e) => {
    console.log("logging in...")
    e.preventDefault();
    try {
        //await window.api.switch_to_main_window();
        window.location.href = "home/home.html"

        // NOTE: FOR PROD:

        // ----------------------------------------------------
        //const status = await window.api.login(username.value, password.value);
        //if (!status) {
        //    console.log("Invalid Credentials.");
        //}
        //else {
        //    await window.api.switch_to_main_window();
        //}
        // ----------------------------------------------------
        //
    } catch (err) {
        console.log("Somethin went wrong.");
    }
})
