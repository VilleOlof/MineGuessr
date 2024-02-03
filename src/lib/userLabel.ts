export module UserLabelPanel {
    const BASE = "/api/label";

    export async function Get(username: string): Promise<string[]> {
        if (!username) throw new Error('Missing username');

        const res = await fetch(`${BASE}?username=${username}`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        return data.labels;
    }

    export async function Set(username: string, labels: string[]) {
        if (!username || !labels) throw new Error('Missing username or labels');

        const res = await fetch(BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, labels })
        });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        return data.labels;
    }

    export async function Remove(username: string, labels: string[]) {
        if (!username || !labels) throw new Error('Missing username or labels');

        const res = await fetch(BASE, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, labels })
        });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        return data.labels;
    }

    export async function Update(username: string, labels: string[]) {
        if (!username || !labels) throw new Error('Missing username or labels');

        const res = await fetch(BASE, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, labels })
        });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        return data.labels;
    }
}