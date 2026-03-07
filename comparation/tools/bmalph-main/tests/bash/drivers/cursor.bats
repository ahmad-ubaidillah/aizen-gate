#!/usr/bin/env bats
# Tests for ralph/drivers/cursor.sh
# Validates CLI binary, tool list, and command assembly for Cursor CLI.

setup() {
    load '../test_helper/common-setup'
    _common_setup
    source "$RALPH_DRIVERS/cursor.sh"
}

teardown() {
    _common_teardown
}

# ===========================================================================
# Driver identification
# ===========================================================================

@test "driver_cli_binary returns agent" {
    run driver_cli_binary
    assert_output "agent"
}

@test "driver_name returns cursor" {
    run driver_name
    assert_output "cursor"
}

@test "driver_display_name returns Cursor CLI" {
    run driver_display_name
    assert_output "Cursor CLI"
}

@test "driver_min_version returns semver string" {
    run driver_min_version
    assert_success
    assert_output --regexp '^[0-9]+\.[0-9]+\.[0-9]+$'
}

# ===========================================================================
# driver_valid_tools
# ===========================================================================

@test "driver_valid_tools has cursor-specific tool names" {
    driver_valid_tools

    [[ " ${VALID_TOOL_PATTERNS[*]} " =~ " file_edit " ]]
    [[ " ${VALID_TOOL_PATTERNS[*]} " =~ " file_read " ]]
    [[ " ${VALID_TOOL_PATTERNS[*]} " =~ " terminal " ]]
    [[ " ${VALID_TOOL_PATTERNS[*]} " =~ " search " ]]
}

@test "driver_valid_tools does not contain Claude Code tool names" {
    driver_valid_tools

    [[ ! " ${VALID_TOOL_PATTERNS[*]} " =~ " Write " ]]
    [[ ! " ${VALID_TOOL_PATTERNS[*]} " =~ " Read " ]]
    [[ ! " ${VALID_TOOL_PATTERNS[*]} " =~ " Bash " ]]
    [[ ! " ${VALID_TOOL_PATTERNS[*]} " =~ " Glob " ]]
}

# ===========================================================================
# driver_build_command
# ===========================================================================

@test "driver_build_command uses print and force flags" {
    local prompt_file="$RALPH_DIR/prompt.md"
    echo "Implement the feature" > "$prompt_file"

    driver_build_command "$prompt_file" "" ""

    local args_str="${CLAUDE_CMD_ARGS[*]}"
    [[ "$args_str" =~ "--print" ]]
    [[ "$args_str" =~ "--force" ]]
}

@test "driver_build_command includes output-format stream-json" {
    local prompt_file="$RALPH_DIR/prompt.md"
    echo "Test prompt" > "$prompt_file"

    driver_build_command "$prompt_file" "" ""

    local args_str="${CLAUDE_CMD_ARGS[*]}"
    [[ "$args_str" =~ "--output-format stream-json" ]]
}

@test "driver_build_command prepends context to prompt" {
    local prompt_file="$RALPH_DIR/prompt.md"
    echo "Implement auth module" > "$prompt_file"

    driver_build_command "$prompt_file" "Loop 2 context: progress detected" ""

    # Last arg is the combined prompt
    local last_arg="${CLAUDE_CMD_ARGS[${#CLAUDE_CMD_ARGS[@]}-1]}"
    [[ "$last_arg" =~ "Loop 2 context" ]]
    [[ "$last_arg" =~ "Implement auth module" ]]
}

@test "driver_build_command resumes session when CLAUDE_USE_CONTINUE is true" {
    local prompt_file="$RALPH_DIR/prompt.md"
    echo "Test prompt" > "$prompt_file"

    CLAUDE_USE_CONTINUE=true
    driver_build_command "$prompt_file" "" "session-cursor-456"

    local args_str="${CLAUDE_CMD_ARGS[*]}"
    [[ "$args_str" =~ "--resume session-cursor-456" ]]
}

@test "driver_build_command skips session when CLAUDE_USE_CONTINUE is false" {
    local prompt_file="$RALPH_DIR/prompt.md"
    echo "Test prompt" > "$prompt_file"

    CLAUDE_USE_CONTINUE=false
    driver_build_command "$prompt_file" "" "session-cursor-456"

    local args_str="${CLAUDE_CMD_ARGS[*]}"
    [[ ! "$args_str" =~ "--resume" ]]
}

@test "driver_build_command does not use --append-system-prompt" {
    local prompt_file="$RALPH_DIR/prompt.md"
    echo "Test prompt" > "$prompt_file"

    driver_build_command "$prompt_file" "Some context" ""

    local args_str="${CLAUDE_CMD_ARGS[*]}"
    [[ ! "$args_str" =~ "--append-system-prompt" ]]
}

@test "driver_build_command fails with missing prompt file" {
    run driver_build_command "/nonexistent/prompt.md" "" ""
    assert_failure
}

# ===========================================================================
# driver_supports_sessions
# ===========================================================================

@test "driver_supports_sessions returns success" {
    run driver_supports_sessions
    assert_success
}

# ===========================================================================
# driver_stream_filter
# ===========================================================================

@test "driver_stream_filter contains text extraction pattern" {
    run driver_stream_filter
    assert_success
    assert_output 'select(.type == "text") | .content // empty'
}
