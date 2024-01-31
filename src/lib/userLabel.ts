export module UserLabel {
    /** Label name and it's corresponding hex color */
    export const Labels: { [key: string]: string } = {
        '90gQ': '#15803d',
        'Marre': '#129296'
    } as const;

    export function get_valid_labels(labels: string[]): string[] {
        return labels.filter(label => label in Labels);
    }

    export function get_label_color(label: string): string {
        return Labels[label] || '#ffffff';
    }

    export function is_valid(label: string): boolean {
        return label in Labels;
    }

    export module Panel {
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
}