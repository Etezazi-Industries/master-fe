// @ts-check

import { fetch_users, get_user_quickviews, get_user_dashboards, remove_qv_access, remove_db_access, add_qv, add_db } from "./api.js"


// TODO: add event listeners for search box.
document.addEventListener("DOMContentLoaded", async () => {
    const users_box = document.getElementById("users");
    const qv_box = document.getElementById("accessedQuickViews");
    const db_box = document.getElementById("accessedDashboards");
    const overlay = document.getElementById('loadingOverlay');


    const API_URL = 'http://127.0.0.1:8000/';


    function showLoading() {
        overlay?.classList.remove('d-none');
    }


    function hideLoading() {
        overlay?.classList.add('d-none');
    }


    async function withLoading(task, params) {
        showLoading();
        try {
            return params ? await task(params) : await task();
        } finally {
            hideLoading();
        }
    }


    function populate_users(users) {
        for (const [id, info] of Object.entries(users)) {
            const firstname = info[0];
            const lastname = info[1];
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = `${firstname} ${lastname}`
            opt.addEventListener("click", async () => await get_user_db_qv(id));
            users_box?.append(opt);
        }
    }


    async function get_user_db_qv(user_id) {
        const dashboards = await withLoading(get_user_dashboards, user_id);
        const quickviews = await withLoading(get_user_quickviews, user_id);
        if (qv_box) qv_box.innerHTML = '';
        if (db_box) db_box.innerHTML = '';
        if (quickviews) {
            for (const [id, name] of Object.entries(quickviews)) {
                const opt = document.createElement("option");
                opt.value = id;
                opt.textContent = name;
                qv_box?.appendChild(opt);
            }
        }
        if (dashboards) {
            for (const [id, name] of Object.entries(dashboards)) {
                const opt = document.createElement("option");
                opt.value = id;
                opt.textContent = name;
                db_box?.appendChild(opt);
            }
        }
    }


    const users = await withLoading(fetch_users, null);
    populate_users(users);


    async function remove_access_qv_db() {
        const selectedUser = users_box?.value;

        if (!selectedUser) {
            console.error("Event fired when no user was selected");
            return;
        }
        console.log("Selected user ID:", selectedUser);
        const selected_qvs = Array.from(qv_box?.selectedOptions).map(opt => opt.value);
        const selected_dbs = Array.from(db_box?.selectedOptions).map(opt => opt.value);
        if (selected_dbs) {
            console.log(selected_dbs);
            await remove_db_access(selectedUser, selected_dbs);
        }
        if (selected_qvs) {
            console.log(selected_qvs);
            await remove_qv_access(selectedUser, selected_qvs);
        }
        await get_user_db_qv(selectedUser);
    }

    document.getElementById("btnRemove")?.addEventListener("click", async () => await withLoading(remove_access_qv_db));


    // ADD 
    const addDbList = document.getElementById("dashboardsList");
    const addQvList = document.getElementById("quickViewsList");


    function populate_add_modal_listboxes(listbox_element, data) {
        for (const [id, name] of Object.entries(data)) {
            const wrapper = document.createElement("div");
            wrapper.className = "form-check";

            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "form-check-input";
            input.id = `db-${id}`;
            input.value = id;

            const label = document.createElement("label");
            label.className = "form-check-label";
            label.htmlFor = input.id;
            label.textContent = name; // frontend value shown

            wrapper.append(input, label);
            listbox_element?.appendChild(wrapper);
        }
    }


    async function populate_add_modal() {
        // TODO: need to filter out all the qvs and dbs that are already mapped to the user.
        const response = await fetch(`${API_URL}dashboards`);
        const data = await response.json();

        populate_add_modal_listboxes(addDbList, data);

        const res = await fetch(`${API_URL}quickviews`);
        const dta = await res.json();

        populate_add_modal_listboxes(addQvList, dta);
    }


    const addModalEl = document.getElementById('addModal');
    document.getElementById('btnAdd')?.addEventListener('click', async () => {
        if (addDbList && addQvList) {
            addQvList.innerHTML = '';
            addDbList.innerHTML = '';
        }
        await withLoading(populate_add_modal);
        bootstrap.Modal.getOrCreateInstance(addModalEl).show();
    });


    async function add_db_qv_to_user() {
        const selectedDashboards = Array.from(
            document.querySelectorAll("#dashboardsList input[type=checkbox]:checked")
        ).map(cb => cb.value);

        const selectedQuickViews = Array.from(
            document.querySelectorAll("#quickViewsList input[type=checkbox]:checked")
        ).map(cb => cb.value);

        console.log("Dashboards:", selectedDashboards);
        console.log("Quick Views:", selectedQuickViews);

        // api requests
        const selectedUser = users_box?.value;
        console.log("Selected user ID:", selectedUser);

        for (const db of selectedDashboards) {
            await add_db(selectedUser, db);
        }

        for (const qv of selectedQuickViews) {
            await add_qv(selectedUser, qv);
        }

        await get_user_db_qv(selectedUser);

        if (addModalEl) {
            bootstrap.Modal.getOrCreateInstance(addModalEl).hide();
        }
    }

    document.getElementById("confirmAdd")?.addEventListener("click", async () => await withLoading(add_db_qv_to_user()))
})
