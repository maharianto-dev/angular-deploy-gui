#[derive(serde::Serialize)]
pub struct CommandResultStruct<T> {
    pub command_result: bool,
    pub command_message: String,
    pub command_data: Option<T>,
}

impl CommandResultStruct<()> {
    pub fn initialize() -> Self {
        CommandResultStruct {
            command_result: false,
            command_message: "init".to_string(),
            command_data: None,
        }
    }

    pub fn new(new_command_result: bool, new_command_message: &str) -> Self {
        CommandResultStruct {
            command_result: new_command_result,
            command_message: new_command_message.to_string(),
            command_data: None,
        }
    }
}

impl<T> CommandResultStruct<T> {
    pub fn new_with_generic(
        new_command_result: bool,
        new_command_message: &str,
        new_command_data: T,
    ) -> Self {
        CommandResultStruct {
            command_result: new_command_result,
            command_message: new_command_message.to_string(),
            command_data: Some(new_command_data),
        }
    }
}

#[derive(serde::Serialize)]
pub struct CheckConfigFileReturnStruct {
    pub is_found: bool,
    pub message: String,
}

#[derive(serde::Serialize)]
pub struct SetPathResultReturnStruct {
    pub is_nx_dir: bool,
    pub json_value: Vec<String>,
}
