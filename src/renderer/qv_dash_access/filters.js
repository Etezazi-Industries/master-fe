// @ts-check

document.addEventListener("DOMContentLoaded", async () => {
    const user_search = document.getElementById("searchUsers");
    const quickview_search = document.getElementById("searchAccessedQV");
    const dashboard_search = document.getElementById("searchAccessedDB");


    const usersListbox = document.getElementById("users");
    const qv_box = document.getElementById("accessedQuickViews");
    const db_box = document.getElementById("accessedDashboards");


    async function search_main_page(element, search_value) {
        const query = search_value.trim().toLowerCase();
        const options = element?.options;

        if (!query) {
            console.log("no query");
            for (const opt of options) {
                opt.hidden = false;
            }
            return;
        }

        if (options) {
            for (const opt of options) {
                const text = opt.text.toLowerCase();
                if (!text.includes(query)) {
                    opt.hidden = true;
                }
                else {
                    opt.hidden = false;
                }
            }
        }
        else {
            console.log("nothing exists in element");
        }
    }


    async function search_add_page(element, search_value) {
        const normalized = search_value.trim().toLowerCase();
        const rows = element.querySelectorAll(".form-check");

        rows.forEach(row => {
            const label = row.querySelector("label");
            const text = label.textContent.toLowerCase();

            if (!normalized || text.includes(normalized)) {
                row.hidden = false;
            } else {
                row.hidden = true;
            }
        })
    }


    user_search?.addEventListener("input", () => search_main_page(usersListbox, user_search.value))
    dashboard_search?.addEventListener("input", () => search_main_page(db_box, dashboard_search.value))
    quickview_search?.addEventListener("input", () => search_main_page(qv_box, quickview_search.value))

    const addDashboardSearch = document.getElementById("searchDashboards");
    const addQuickviewSearch = document.getElementById("searchQuickViews");

    const addDbList = document.getElementById("dashboardsList");
    const addQvList = document.getElementById("quickViewsList");

    addDashboardSearch?.addEventListener("input", () => search_add_page(addDbList, addDashboardSearch.value))
    addQuickviewSearch?.addEventListener("input", () => search_add_page(addQvList, addQuickviewSearch.value))
})
