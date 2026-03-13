use wasm_bindgen::prelude::*;
use std::collections::HashSet;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[wasm_bindgen]
pub fn calculate_jaccard(a: &str, b: &str) -> f32 {
    let set_a: HashSet<&str> = a.split_whitespace().collect();
    let set_b: HashSet<&str> = b.split_whitespace().collect();
    
    let intersection = set_a.intersection(&set_b).count();
    let union = set_a.union(&set_b).count();
    
    if union == 0 { return 0.0; }
    intersection as f32 / union as f32
}

#[derive(Serialize, Deserialize)]
pub struct VectorClock {
    pub clocks: HashMap<String, u64>,
}

#[wasm_bindgen]
pub fn merge_vector_clocks(clock_a_json: &str, clock_b_json: &str) -> String {
    let mut clock_a: HashMap<String, u64> = serde_json::from_str(clock_a_json).unwrap_or_default();
    let clock_b: HashMap<String, u64> = serde_json::from_str(clock_b_json).unwrap_or_default();
    
    for (node, clock) in clock_b {
        let entry = clock_a.entry(node).or_insert(0);
        if clock > *entry {
            *entry = clock;
        }
    }
    
    serde_json::to_string(&clock_a).unwrap_or_else(|_| "{}".to_string())
}

#[wasm_bindgen]
pub fn heuristic_distill(text: &str) -> String {
    let mut parts = Vec::new();
    let lower = text.to_lowercase();
    
    if lower.contains("error") || lower.contains("fail") { parts.push("status:error"); }
    else if lower.contains("success") || lower.contains("done") { parts.push("status:success"); }
    
    // Action extraction
    if lower.contains("update") { parts.push("action:update"); }
    else if lower.contains("create") { parts.push("action:create"); }
    else if lower.contains("delete") { parts.push("action:delete"); }
    
    if parts.is_empty() {
        text.chars().take(50).collect::<String>().replace(" ", "_")
    } else {
        parts.join("|")
    }
}
