use serde::Serialize;

use crate::structs::returns_struct::CommandResultStruct;

#[derive(Serialize)]
pub enum NoDataOrWithDataStruct<T> {
    NoData(CommandResultStruct<()>),
    WithData(CommandResultStruct<T>),
}

#[derive(PartialEq)]
pub enum AppKind {
    Core,
    Portal,
}
