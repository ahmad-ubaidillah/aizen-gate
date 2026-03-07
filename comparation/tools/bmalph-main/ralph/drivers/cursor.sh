#!/bin/bash
# Cursor CLI driver for Ralph (EXPERIMENTAL)
# Provides platform-specific CLI invocation logic for Cursor CLI.
#
# Known limitations:
# - CLI is in beta — binary name and flags may change
# - NDJSON stream format assumes {type: "text", content: "..."} events
# - Session ID capture from output not yet validated

driver_name() {
    echo "cursor"
}

driver_display_name() {
    echo "Cursor CLI"
}

driver_cli_binary() {
    echo "agent"
}

driver_min_version() {
    echo "0.1.0"
}

driver_check_available() {
    command -v "$(driver_cli_binary)" &>/dev/null
}

# Cursor CLI tool names
driver_valid_tools() {
    VALID_TOOL_PATTERNS=(
        "file_edit"
        "file_read"
        "file_write"
        "terminal"
        "search"
    )
}

# Build Cursor CLI command
# Context is prepended to the prompt (same pattern as Codex/Copilot drivers).
# Uses --print for headless mode, --force for autonomous execution,
# --output-format stream-json for NDJSON streaming.
driver_build_command() {
    local prompt_file=$1
    local loop_context=$2
    local session_id=$3

    CLAUDE_CMD_ARGS=("$(driver_cli_binary)")

    if [[ ! -f "$prompt_file" ]]; then
        echo "ERROR: Prompt file not found: $prompt_file" >&2
        return 1
    fi

    # Headless mode
    CLAUDE_CMD_ARGS+=("--print")

    # Autonomous execution
    CLAUDE_CMD_ARGS+=("--force")

    # NDJSON streaming output
    CLAUDE_CMD_ARGS+=("--output-format" "stream-json")

    # Session resume — gated on CLAUDE_USE_CONTINUE to respect --no-continue flag
    if [[ "$CLAUDE_USE_CONTINUE" == "true" && -n "$session_id" ]]; then
        CLAUDE_CMD_ARGS+=("--resume" "$session_id")
    fi

    # Build prompt with context prepended
    local prompt_content
    prompt_content=$(cat "$prompt_file")
    if [[ -n "$loop_context" ]]; then
        prompt_content="$loop_context

$prompt_content"
    fi

    CLAUDE_CMD_ARGS+=("$prompt_content")
}

driver_supports_sessions() {
    return 0  # true — Cursor supports --resume
}

# Cursor CLI outputs NDJSON events
driver_stream_filter() {
    echo 'select(.type == "text") | .content // empty'
}
