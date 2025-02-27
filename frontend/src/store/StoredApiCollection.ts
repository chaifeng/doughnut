import { Router } from "vue-router";
import ManagedApi from "../managedApi/ManagedApi";
import apiCollection from "../managedApi/apiCollection";
import NoteEditingHistory from "./NoteEditingHistory";
import NoteStorage from "./NoteStorage";

export interface StoredApi {
  getNoteRealmAndReloadPosition(
    noteId: Doughnut.ID
  ): Promise<Generated.NoteRealm>;

  createNote(
    parentId: Doughnut.ID,
    data: Generated.NoteCreation
  ): Promise<Generated.NoteRealm>;

  createLink(
    sourceId: Doughnut.ID,
    targetId: Doughnut.ID,
    data: Generated.LinkCreation
  ): Promise<Generated.NoteRealm>;

  updateLink(
    linkId: Doughnut.ID,
    data: Generated.LinkCreation
  ): Promise<Generated.NoteRealm>;

  deleteLink(
    linkId: Doughnut.ID,
    fromTargetPerspective: boolean
  ): Promise<Generated.NoteRealm>;

  updateNoteAccessories(
    noteId: Doughnut.ID,
    noteAccessories: Generated.NoteAccessories
  ): Promise<Generated.NoteRealm>;

  updateTextContent(
    noteId: Doughnut.ID,
    noteContentData: Generated.TextContent,
    oldContent: Generated.TextContent
  ): Promise<Generated.NoteRealm>;

  updateWikidataId(
    noteId: Doughnut.ID,
    data: Generated.WikidataAssociationCreation
  ): Promise<Generated.NoteRealm>;

  undo(): Promise<Generated.NoteRealm>;

  deleteNote(noteId: Doughnut.ID): Promise<Generated.NoteRealm | undefined>;
}
export default class StoredApiCollection implements StoredApi {
  noteEditingHistory: NoteEditingHistory;

  managedApi: ManagedApi;

  storage: NoteStorage;

  router: Router;

  constructor(
    undoHistory: NoteEditingHistory,
    router: Router,
    storage: NoteStorage
  ) {
    this.managedApi = new ManagedApi();
    this.noteEditingHistory = undoHistory;
    this.storage = storage;
    this.router = router;
  }

  private routerReplace(focusOnNote?: Generated.NoteRealm) {
    if (!focusOnNote) {
      return this.router.replace({ name: "notebooks" });
    }
    return this.router.replace({
      name: "noteShow",
      params: { noteId: focusOnNote.id },
    });
  }

  private routerPush(focusOnNote: Generated.NoteRealm) {
    return this.router.push({
      name: "noteShow",
      params: { noteId: focusOnNote.id },
    });
  }

  private get statelessApi(): ReturnType<typeof apiCollection> {
    return apiCollection(this.managedApi);
  }

  private async updateTextContentWithoutUndo(
    noteId: Doughnut.ID,
    noteContentData: Generated.TextContent
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { updatedAt, ...data } = noteContentData;
    return (await this.managedApi.restPatchMultiplePartForm(
      `text_content/${noteId}`,
      data
    )) as Generated.NoteRealm;
  }

  async updateWikidataId(
    noteId: Doughnut.ID,
    data: Generated.WikidataAssociationCreation
  ): Promise<Generated.NoteRealm> {
    return this.storage.refreshNoteRealm(
      await this.statelessApi.wikidata.updateWikidataId(noteId, data)
    );
  }

  async getNoteRealmAndReloadPosition(noteId: Doughnut.ID) {
    const nrwp = await this.statelessApi.noteMethods.getNoteRealmWithPosition(
      noteId
    );
    this.storage.selectPosition(nrwp.noteRealm.note, nrwp.notePosition);
    return this.storage.refreshNoteRealm(nrwp.noteRealm);
  }

  async createNote(parentId: Doughnut.ID, data: Generated.NoteCreation) {
    const nrwp = await this.statelessApi.noteMethods.createNote(parentId, data);
    this.storage.selectPosition(nrwp.noteRealm.note, nrwp.notePosition);
    const focus = this.storage.refreshNoteRealm(nrwp.noteRealm);
    this.routerReplace(focus);
    return focus;
  }

  async createLink(
    sourceId: Doughnut.ID,
    targetId: Doughnut.ID,
    data: Generated.LinkCreation
  ) {
    return this.storage.refreshNoteRealm(
      (await this.managedApi.restPost(
        `links/create/${sourceId}/${targetId}`,
        data
      )) as Generated.NoteRealm
    );
  }

  async updateLink(linkId: Doughnut.ID, data: Generated.LinkCreation) {
    return this.storage.refreshNoteRealm(
      (await this.managedApi.restPost(
        `links/${linkId}`,
        data
      )) as Generated.NoteRealm
    );
  }

  async deleteLink(linkId: Doughnut.ID, fromTargetPerspective: boolean) {
    return this.storage.refreshNoteRealm(
      (await this.managedApi.restPost(
        `links/${linkId}/${fromTargetPerspective ? "tview" : "sview"}/delete`,
        {}
      )) as Generated.NoteRealm
    );
  }

  async updateNoteAccessories(
    noteId: Doughnut.ID,
    noteContentData: Generated.NoteAccessories
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { updatedAt, ...data } = noteContentData;
    return this.storage.refreshNoteRealm(
      (await this.managedApi.restPatchMultiplePartForm(
        `notes/${noteId}`,
        data
      )) as Generated.NoteRealm
    );
  }

  async updateTextContent(
    noteId: Doughnut.ID,
    noteContentData: Generated.TextContent,
    oldContent: Generated.TextContent
  ) {
    this.noteEditingHistory.addEditingToUndoHistory(noteId, oldContent);
    return this.storage.refreshNoteRealm(
      await this.updateTextContentWithoutUndo(noteId, noteContentData)
    );
  }

  private async undoInner() {
    const undone = this.noteEditingHistory.peekUndo();
    if (!undone) throw new Error("undo history is empty");
    this.noteEditingHistory.popUndoHistory();
    if (undone.type === "editing" && undone.textContent) {
      return this.updateTextContentWithoutUndo(
        undone.noteId,
        undone.textContent
      );
    }
    return (await this.managedApi.restPatch(
      `notes/${undone.noteId}/undo-delete`,
      {}
    )) as Generated.NoteRealm;
  }

  async undo() {
    const noteRealm = this.storage.refreshNoteRealm(await this.undoInner());
    this.routerPush(noteRealm);
    return noteRealm;
  }

  async deleteNote(noteId: Doughnut.ID) {
    const res = (await this.managedApi.restPost(
      `notes/${noteId}/delete`,
      {}
    )) as Generated.NoteRealm[];
    this.noteEditingHistory.deleteNote(noteId);
    if (res.length === 0) {
      this.storage.focusOnNotebooks();
      this.routerReplace();
      return undefined;
    }
    const noteRealm = this.storage.refreshNoteRealm(res[0]);
    this.routerReplace(noteRealm);
    return noteRealm;
  }
}
