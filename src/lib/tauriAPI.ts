/**
 * Transparent shim replacing Electron/Tauri IPC with safe browser fallbacks.
 * Zero static @tauri-apps imports so it runs cleanly on standard web browsers.
 */

const invoke = async (cmd: string, args?: any): Promise<any> => {
  if (typeof window !== "undefined") {
    const tauri = (window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__;
    if (tauri && typeof tauri.invoke === "function") {
      return await tauri.invoke(cmd, args);
    }
  }
  return null;
};

export const tauriAPI = {
  checkNativeTools: () => invoke("check_native_tools"),

  embedMetadata: async (fileData: any, metadata: any) => {
    const payload: any = {
      name: fileData.name,
      mimeType: fileData.mimeType,
      metadata
    };

    if (fileData.path) {
      payload.path = fileData.path;
    } else if (fileData.buffer) {
      payload.buffer = new Uint8Array(fileData.buffer);
    }

    const result: any = await invoke("embed_metadata", { payload });
    if (!result) return null;
    return {
      filename: result.filename,
      blob: new Blob([new Uint8Array(result.buffer).buffer], { type: result.mimeType || 'application/octet-stream' })
    };
  },

  generateVectorPreview: async (fileData: any) => {
    const payload: any = {
      name: fileData.name,
      metadata: fileData.metadata || null
    };

    if (fileData.path) {
      payload.path = fileData.path;
    } else if (fileData.buffer) {
      payload.buffer = new Uint8Array(fileData.buffer);
    }

    const result: any = await invoke("generate_vector_preview", { payload });
    if (!result) return null;
    return {
      buffer: new Uint8Array(result.buffer).buffer,
      mimeType: result.mimeType,
      aspectRatio: result.aspectRatio,
      isVertical: result.isVertical
    };
  },

  generateVideoGridFallback: async (fileData: any) => {
    const payload: any = {
      name: fileData.name,
      metadata: null
    };

    if (fileData.path) {
      payload.path = fileData.path;
    } else if (fileData.buffer) {
      payload.buffer = new Uint8Array(fileData.buffer);
    }

    const result: any = await invoke("generate_video_grid", { payload });
    if (!result) return null;
    return {
      buffer: new Uint8Array(result.buffer).buffer,
      mimeType: result.mimeType,
      aspectRatio: result.aspectRatio,
      isVertical: result.isVertical
    };
  },

  probeMedia: async (fileData: any) => {
    const payload: any = {
      name: fileData.name,
      mimeType: fileData.mimeType,
    };
    if (fileData.path) {
      payload.path = fileData.path;
    } else if (fileData.buffer) {
      payload.buffer = new Uint8Array(fileData.buffer);
    }
    return await invoke("probe_media", { payload });
  },

  zipSessionStart: () => invoke("zip_session_start"),

  zipSessionAddFile: async (sessionId: string, asset: any) => {
    const payload: any = {
      sessionId,
      name: asset.name,
      mimeType: asset.mimeType,
      metadata: asset.metadata,
    };
    if (asset.path) {
      payload.path = asset.path;
    } else if (asset.buffer) {
      payload.buffer = new Uint8Array(asset.buffer);
    }
    return invoke("zip_session_add_file", { payload });
  },

  zipSessionFinalize: (sessionId: string) => invoke("zip_session_finalize", { payload: { sessionId } }),

  exportFlatZip: async (items: any[]) => {
    const payload = items.map(it => ({
      name: it.name,
      mimeType: it.mimeType,
      buffer: new Uint8Array(it.buffer),
      metadata: it.metadata
    }));
    const result: any = await invoke("export_flat_zip", { items: payload });
    if (!result) return null;
    return {
      filename: result.filename,
      blob: new Blob([new Uint8Array(result.buffer).buffer], { type: 'application/zip' })
    };
  },

  testFtpConnection: (credentials: any) => invoke("test_ftp_connection", { credentials }),

  listFtpDirectories: (credentials: any, remotePath: string) =>
    invoke("list_ftp_directories", { payload: { credentials, remotePath } }),

  uploadFtpBatch: (platform: string, credentials: any, items: any[]) => {
    const payload = items.map(it => ({
      name: it.name,
      path: it.path,
      buffer: it.path ? undefined : new Uint8Array(it.buffer),
      metadata: it.metadata
    }));
    return invoke("upload_ftp_batch", { payload: { platform, credentials, items: payload } });
  },

  onFtpProgress: (_callback: Function) => {
    return () => {};
  },

  offFtpProgress: (handler: any) => {
    if (typeof handler === "function") {
      handler();
    }
  },

  getMachineId: () => invoke("get_machine_id"),

  verifyLaunchState: (nonce?: string) => invoke("verify_launch_state", { nonce }),

  storeLicense: (data: any) => invoke("store_license", { data }),
  readLicense: () => invoke("read_license"),
  clearLicense: () => invoke("clear_license"),

  quitApp: () => invoke("quit_app"),

  openExternal: (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
    return Promise.resolve();
  },

  encryptApiKeys: (json: string | object) => {
      const data = typeof json === "string" ? json : JSON.stringify(json);
      return invoke("encrypt_api_keys", { json: data });
  },
  decryptApiKeys: (encrypted: string) => invoke("decrypt_api_keys", { encrypted }),
};
