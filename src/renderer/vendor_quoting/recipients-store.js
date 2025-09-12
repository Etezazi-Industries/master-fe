// @ts-check

export const RecipientsStore = {
    data: {},

    set(category, emails) {
        this.data[category] = emails.filter(Boolean);
        console.log(this.data);
    },

    reset() {
        this.data = {};
    },

    toObject() {
        return { ...this.data };
    }
};

