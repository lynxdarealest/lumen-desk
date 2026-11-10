use std::{fs::OpenOptions, io::Write};
use tauri::{AppHandle, Manager, Window};

#[cfg(windows)]
use windows::core::w;
#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::{
    FindWindowExW, FindWindowW, GetSystemMetrics, GetWindowLongPtrW, SendMessageTimeoutW,
    SetParent, SetWindowLongPtrW, SetWindowPos, GWL_EXSTYLE, GWL_STYLE, HWND_BOTTOM,
    SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN, SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN,
    SM_CXSCREEN, SM_CYSCREEN, SMTO_NORMAL, SWP_NOACTIVATE, SWP_SHOWWINDOW, WS_CHILD,
    WS_EX_APPWINDOW, WS_EX_TOOLWINDOW, WS_VISIBLE,
};

#[tauri::command]
fn write_log(app: AppHandle, level: String, message: String) -> Result<(), String> {
    let log_dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
    std::fs::create_dir_all(&log_dir).map_err(|error| error.to_string())?;
    let log_path = log_dir.join("lumen-desk.log");
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|error| error.to_string())?
        .as_secs();
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
        .map_err(|error| error.to_string())?;
    writeln!(file, "[{timestamp}] [{level}] {message}").map_err(|error| error.to_string())
}

#[tauri::command]
fn set_wallpaper_mode(window: Window, enabled: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        let hwnd = window.hwnd().map_err(|error| error.to_string())?;
        if enabled {
            let progman = unsafe { FindWindowW(w!("Progman"), None) }
                .map_err(|error| error.to_string())?;
            unsafe {
                let _ = SendMessageTimeoutW(
                    progman,
                    0x052C,
                    windows::Win32::Foundation::WPARAM(0),
                    windows::Win32::Foundation::LPARAM(0),
                    SMTO_NORMAL,
                    1000,
                    None,
                );
            }
            let worker = unsafe { FindWindowExW(Some(progman), None, w!("WorkerW"), None) }
                .unwrap_or(progman);
            unsafe {
                let style = GetWindowLongPtrW(hwnd, GWL_STYLE);
                SetWindowLongPtrW(hwnd, GWL_STYLE, style | WS_CHILD.0 as isize | WS_VISIBLE.0 as isize);
                let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
                SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex_style & !(WS_EX_APPWINDOW.0 as isize) | WS_EX_TOOLWINDOW.0 as isize);
                SetParent(hwnd, Some(worker)).map_err(|error| error.to_string())?;
                let x = GetSystemMetrics(SM_XVIRTUALSCREEN);
                let y = GetSystemMetrics(SM_YVIRTUALSCREEN);
                let width = GetSystemMetrics(SM_CXVIRTUALSCREEN).max(GetSystemMetrics(SM_CXSCREEN));
                let height = GetSystemMetrics(SM_CYVIRTUALSCREEN).max(GetSystemMetrics(SM_CYSCREEN));
                SetWindowPos(hwnd, Some(HWND_BOTTOM), x, y, width, height, SWP_NOACTIVATE | SWP_SHOWWINDOW)
                    .map_err(|error| error.to_string())?;
            }
        } else {
            unsafe {
                SetParent(hwnd, None).map_err(|error| error.to_string())?;
                let style = GetWindowLongPtrW(hwnd, GWL_STYLE);
                SetWindowLongPtrW(hwnd, GWL_STYLE, style & !(WS_CHILD.0 as isize));
                let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
                SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex_style | WS_EX_APPWINDOW.0 as isize & !(WS_EX_TOOLWINDOW.0 as isize));
                SetWindowPos(hwnd, Some(HWND_BOTTOM), 100, 100, 1440, 900, SWP_NOACTIVATE | SWP_SHOWWINDOW)
                    .map_err(|error| error.to_string())?;
            }
        }
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = (window, enabled);
        Err("Wallpaper mode is only supported on Windows.".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![write_log, set_wallpaper_mode])
        .run(tauri::generate_context!())
        .expect("error while running Lumen Desk");
}
