const API_URL = 'http://127.0.0.1:8000/';

async function fetch_users() {
    const res = await fetch(`${API_URL}users`, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        console.error('Failed to users.', res.status);
        return {};
    }
    const data = await res.json();
    return data;
}


async function get_user_quickviews(user_id) {
    const res = await fetch(`${API_URL}users/${user_id}/access/quickviews`, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        console.error('Failed to users.', res.status);
        return {};
    }
    const quickviews = await res.json();
    return quickviews
}


async function get_user_dashboards(user_id) {
    const res = await fetch(`${API_URL}users/${user_id}/access/dashboards`, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        console.error('Failed to users.', res.status);
        return {};
    }
    const dashboards = await res.json();
    return dashboards;
}


async function remove_qv_access(user_id, selected_qvs) {
    let err_buff = [];
    console.log(`deleting ${selected_qvs}`);
    for (const id of selected_qvs) {
        try {
            await fetch(`${API_URL}users/${user_id}/access/quickviews/${id}`, {
                method: "DELETE",
                headers: { Accept: 'application/json' }
            })
        } catch (err) {
            err_buff.push(id);
            console.error("Error", err);
        }
    }
}


async function remove_db_access(user_id, selected_dbs) {
    let err_buff = [];
    console.log(`deleting ${selected_dbs}`);
    for (const id of selected_dbs) {
        try {
            await fetch(`${API_URL}users/${user_id}/access/dashboards/${id}`, {
                method: "DELETE",
                headers: { Accept: 'application/json' }
            })
        } catch (err) {
            err_buff.push(id);
            console.error("Error", err);
        }
    }
}


async function add_db(user_id, dashboard_id) {
    const response = await fetch(`${API_URL}users/${user_id}/access/dashboards/${dashboard_id}`, {
        method: "PUT",
        headers: { Accept: 'application/json' }
    })
    if (!response.ok) {
        console.error(response.ok);
    }
    console.log(`added dashboard - ${dashboard_id} to ${user_id}.`)
}


async function add_qv(user_id, quickview_id) {
    const response = await fetch(`${API_URL}users/${user_id}/access/quickviews/${quickview_id}`, {
        method: "PUT",
        headers: { Accept: 'application/json' }
    })
    if (!response.ok) {
        console.error(response.ok);
    }
    console.log(`added quickview - ${quickview_id} to ${user_id}.`)
}


export { fetch_users, get_user_quickviews, get_user_dashboards, remove_qv_access, remove_db_access, add_qv, add_db }
