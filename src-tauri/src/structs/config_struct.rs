use savefile_derive::Savefile;
use serde::Serialize;

#[derive(Savefile, Serialize)]
pub struct AppSelectionConfigStruct {
    pub app_fe_path: String,
    pub app_names: Vec<String>,
}

#[derive(Savefile)]
pub struct ConfigFileDataStruct {
    pub fe_path: Option<String>,
    pub deploy_path: Option<String>,
    pub app_selection: Vec<AppSelectionConfigStruct>,
}
