<template>
  <ContainerPage
    v-bind="{ contentExists: !!formData, title: 'Edit User Setting' }"
  >
    <div v-if="!!formData">
      <form @submit.prevent.once="processForm">
        <TextInput
          scope-name="user"
          field="name"
          v-model="formData.name"
          :autofocus="true"
          :errors="errors.name"
        />
        <TextInput
          scope-name="user"
          field="dailyNewNotesCount"
          v-model="formData.dailyNewNotesCount"
          :errors="errors.dailyNewNotesCount"
        />
        <TextInput
          scope-name="user"
          field="spaceIntervals"
          v-model="formData.spaceIntervals"
          :errors="errors.spaceIntervals"
        />
        <input type="submit" value="Submit" class="btn btn-primary" />
      </form>
    </div>
  </ContainerPage>
</template>

<script>
import ContainerPage from "../../pages/commons/ContainerPage.vue";
import TextInput from "../form/TextInput.vue";
import useLoadingApi from "../../managedApi/useLoadingApi";
import asPopup from "../commons/Popups/asPopup";

export default {
  setup() {
    return { ...useLoadingApi(), ...asPopup() };
  },
  components: { ContainerPage, TextInput },
  emits: ["user-updated"],
  data() {
    return {
      formData: null,
      errors: {},
    };
  },
  methods: {
    async fetchData() {
      this.formData = await this.api.userMethods.currentUser();
    },
    async processForm() {
      const updated = await this.api.userMethods
        .updateUser(this.formData.id, this.formData)
        .catch((err) => {
          this.errors = err;
        });
      this.popup.done(updated);
      this.$emit("user-updated", updated);
    },
  },

  mounted() {
    this.fetchData();
  },
};
</script>
