#[derive(serde::Deserialize)]
pub struct SetPathCommandStruct {
    pub fe_path: String,
    pub server_path: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct RunCommandStruct {
    pub fe_path: String,
    pub server_path: Option<String>,
    pub selected_app: Vec<String>,
    pub use_nx: bool,
    pub skip_nx_cache: bool,
    pub is_nx_dir: bool,
}

#[derive(serde::Deserialize)]
pub struct SaveAppSelectionCommandStruct {
    pub fe_path: String,
    pub app_selection: Vec<String>,
}
