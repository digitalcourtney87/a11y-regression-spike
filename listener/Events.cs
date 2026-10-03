// Hooked WinEvent ranges and names (DR-0019 D10; the scope was approved by
// the owner on 2026-10-03, P3, DR-0052, with the final ranges confirmed from
// M2 data). MSAA events and the IA2 range (0x0101-0x0123, from the
// IAccessible2 AccessibleEventID.idl) are recorded on the "MSAA" and "IA2"
// channels; UIA events are not hooked here and would be diagnostic only.
using System.Collections.Generic;

namespace A11ySpike.Listener;

internal static class Events
{
    /// Inclusive ranges passed to SetWinEventHook. EVENT_OBJECT_LOCATIONCHANGE
    /// (0x800B) is excluded.
    public static readonly (uint Min, uint Max)[] Ranges =
    {
        (0x0002, 0x0003), // EVENT_SYSTEM_ALERT, EVENT_SYSTEM_FOREGROUND
        (0x8002, 0x8005), // EVENT_OBJECT_SHOW, HIDE, REORDER, FOCUS
        (0x800A, 0x800A), // EVENT_OBJECT_STATECHANGE
        (0x800C, 0x800E), // EVENT_OBJECT_NAMECHANGE, DESCRIPTIONCHANGE, VALUECHANGE
        (0x8019, 0x8019), // EVENT_OBJECT_LIVEREGIONCHANGED
        (0x0101, 0x0123), // IA2 events
    };

    private static readonly Dictionary<uint, string> Names = new()
    {
        [0x0002] = "EVENT_SYSTEM_ALERT",
        [0x0003] = "EVENT_SYSTEM_FOREGROUND",
        [0x8002] = "EVENT_OBJECT_SHOW",
        [0x8003] = "EVENT_OBJECT_HIDE",
        [0x8004] = "EVENT_OBJECT_REORDER",
        [0x8005] = "EVENT_OBJECT_FOCUS",
        [0x800A] = "EVENT_OBJECT_STATECHANGE",
        [0x800C] = "EVENT_OBJECT_NAMECHANGE",
        [0x800D] = "EVENT_OBJECT_DESCRIPTIONCHANGE",
        [0x800E] = "EVENT_OBJECT_VALUECHANGE",
        [0x8019] = "EVENT_OBJECT_LIVEREGIONCHANGED",
        [0x0101] = "IA2_EVENT_ACTION_CHANGED",
        [0x0102] = "IA2_EVENT_ACTIVE_DESCENDANT_CHANGED",
        [0x0103] = "IA2_EVENT_DOCUMENT_ATTRIBUTE_CHANGED",
        [0x0104] = "IA2_EVENT_DOCUMENT_CONTENT_CHANGED",
        [0x0105] = "IA2_EVENT_DOCUMENT_LOAD_COMPLETE",
        [0x0106] = "IA2_EVENT_DOCUMENT_LOAD_STOPPED",
        [0x0107] = "IA2_EVENT_DOCUMENT_RELOAD",
        [0x0108] = "IA2_EVENT_HYPERLINK_END_INDEX_CHANGED",
        [0x0109] = "IA2_EVENT_HYPERLINK_NUMBER_OF_ANCHORS_CHANGED",
        [0x010A] = "IA2_EVENT_HYPERLINK_SELECTED_LINK_CHANGED",
        [0x010B] = "IA2_EVENT_HYPERTEXT_LINK_ACTIVATED",
        [0x010C] = "IA2_EVENT_HYPERTEXT_LINK_SELECTED",
        [0x010D] = "IA2_EVENT_HYPERLINK_START_INDEX_CHANGED",
        [0x010E] = "IA2_EVENT_HYPERTEXT_CHANGED",
        [0x010F] = "IA2_EVENT_HYPERTEXT_NLINKS_CHANGED",
        [0x0110] = "IA2_EVENT_OBJECT_ATTRIBUTE_CHANGED",
        [0x0111] = "IA2_EVENT_PAGE_CHANGED",
        [0x0112] = "IA2_EVENT_SECTION_CHANGED",
        [0x0113] = "IA2_EVENT_TABLE_CAPTION_CHANGED",
        [0x0114] = "IA2_EVENT_TABLE_COLUMN_DESCRIPTION_CHANGED",
        [0x0115] = "IA2_EVENT_TABLE_COLUMN_HEADER_CHANGED",
        [0x0116] = "IA2_EVENT_TABLE_MODEL_CHANGED",
        [0x0117] = "IA2_EVENT_TABLE_ROW_DESCRIPTION_CHANGED",
        [0x0118] = "IA2_EVENT_TABLE_ROW_HEADER_CHANGED",
        [0x0119] = "IA2_EVENT_TABLE_SUMMARY_CHANGED",
        [0x011A] = "IA2_EVENT_TEXT_ATTRIBUTE_CHANGED",
        [0x011B] = "IA2_EVENT_TEXT_CARET_MOVED",
        [0x011C] = "IA2_EVENT_TEXT_CHANGED",
        [0x011D] = "IA2_EVENT_TEXT_COLUMN_CHANGED",
        [0x011E] = "IA2_EVENT_TEXT_INSERTED",
        [0x011F] = "IA2_EVENT_TEXT_REMOVED",
        [0x0120] = "IA2_EVENT_TEXT_UPDATED",
        [0x0121] = "IA2_EVENT_TEXT_SELECTION_CHANGED",
        [0x0122] = "IA2_EVENT_VISIBLE_DATA_CHANGED",
        [0x0123] = "IA2_EVENT_ROLE_CHANGED",
    };

    public static string NameOf(uint eventId) => Names.TryGetValue(eventId, out var name) ? name : $"0x{eventId:X4}";

    public static string ChannelOf(uint eventId) => eventId >= 0x0101 && eventId <= 0x0123 ? "IA2" : "MSAA";
}
