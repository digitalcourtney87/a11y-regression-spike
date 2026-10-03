// Win32, MSAA and UIA interop for the B2 listener (DR-0019 D10).
// No IA2 interfaces are declared: identity comes from MSAA and UIA property
// reads only, with no IA2 QueryService and no proxy registration.
using System;
using System.Runtime.InteropServices;
using System.Text;
using Accessibility;

namespace A11ySpike.Listener;

internal static class Native
{
    public const uint WINEVENT_OUTOFCONTEXT = 0x0000;
    public const uint WINEVENT_SKIPOWNPROCESS = 0x0002;
    public const uint WM_QUIT = 0x0012;

    public delegate void WinEventProc(IntPtr hook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint eventThread, uint eventTime);

    [DllImport("user32.dll")]
    public static extern IntPtr SetWinEventHook(uint eventMin, uint eventMax, IntPtr module, WinEventProc callback, uint idProcess, uint idThread, uint flags);

    [DllImport("user32.dll")]
    public static extern bool UnhookWinEvent(IntPtr hook);

    [StructLayout(LayoutKind.Sequential)]
    public struct MSG
    {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public int ptX;
        public int ptY;
    }

    [DllImport("user32.dll")]
    public static extern int GetMessage(out MSG msg, IntPtr hwnd, uint filterMin, uint filterMax);

    [DllImport("user32.dll")]
    public static extern bool TranslateMessage(ref MSG msg);

    [DllImport("user32.dll")]
    public static extern IntPtr DispatchMessage(ref MSG msg);

    [DllImport("user32.dll")]
    public static extern bool PostThreadMessage(uint threadId, uint msg, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll")]
    public static extern uint GetCurrentThreadId();

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetClassName(IntPtr hwnd, StringBuilder buffer, int size);

    [DllImport("oleacc.dll")]
    public static extern int AccessibleObjectFromEvent(IntPtr hwnd, int idObject, int idChild, [MarshalAs(UnmanagedType.Interface)] out IAccessible? acc, out object? child);

    [DllImport("oleacc.dll", CharSet = CharSet.Unicode)]
    public static extern uint GetRoleText(uint role, StringBuilder buffer, uint size);

    public static string ClassOf(IntPtr hwnd)
    {
        var buffer = new StringBuilder(256);
        return GetClassName(hwnd, buffer, buffer.Capacity) > 0 ? buffer.ToString() : "";
    }

    public static string RoleText(object? role)
    {
        if (role is int code)
        {
            var buffer = new StringBuilder(128);
            GetRoleText((uint)code, buffer, 128);
            return buffer.ToString();
        }
        return role as string ?? "";
    }
}

// UIA COM interfaces, declared only up to the slots the listener calls.
// Slots it never calls are placeholders that keep the vtable order of
// UIAutomationClient.idl. The listener validates these declarations at
// start-up (Resolver.ValidateUia) and disables UIA reads if they misbehave.
[ComImport, Guid("30cbe57d-d9d0-452a-ab13-7ac5ac4825ee"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IUIAutomation
{
    void _CompareElements(); void _CompareRuntimeIds(); void _GetRootElement(); void _ElementFromHandle();
    void _ElementFromPoint(); void _GetFocusedElement(); void _GetRootElementBuildCache(); void _ElementFromHandleBuildCache();
    void _ElementFromPointBuildCache(); void _GetFocusedElementBuildCache(); void _CreateTreeWalker(); void _get_ControlViewWalker();
    void _get_ContentViewWalker(); void _get_RawViewWalker(); void _get_RawViewCondition(); void _get_ControlViewCondition();
    void _get_ContentViewCondition(); void _CreateCacheRequest(); void _CreateTrueCondition(); void _CreateFalseCondition();
    void _CreatePropertyCondition(); void _CreatePropertyConditionEx(); void _CreateAndCondition(); void _CreateAndConditionFromArray();
    void _CreateAndConditionFromNativeArray(); void _CreateOrCondition(); void _CreateOrConditionFromArray(); void _CreateOrConditionFromNativeArray();
    void _CreateNotCondition(); void _AddAutomationEventHandler(); void _RemoveAutomationEventHandler(); void _AddPropertyChangedEventHandlerNativeArray();
    void _AddPropertyChangedEventHandler(); void _RemovePropertyChangedEventHandler(); void _AddStructureChangedEventHandler(); void _RemoveStructureChangedEventHandler();
    void _AddFocusChangedEventHandler(); void _RemoveFocusChangedEventHandler(); void _RemoveAllEventHandlers(); void _IntNativeArrayToSafeArray();
    void _IntSafeArrayToNativeArray(); void _RectToVariant(); void _VariantToRect(); void _SafeArrayToRectNativeArray();
    void _CreateProxyFactoryEntry(); void _get_ProxyFactoryMapping(); void _GetPropertyProgrammaticName(); void _GetPatternProgrammaticName();
    void _PollForPotentialSupportedPatterns(); void _PollForPotentialSupportedProperties(); void _CheckNotSupported(); void _get_ReservedNotSupportedValue();
    void _get_ReservedMixedAttributeValue();

    [return: MarshalAs(UnmanagedType.Interface)]
    IUIAutomationElement ElementFromIAccessible([MarshalAs(UnmanagedType.Interface)] IAccessible accessible, int childId);
}

[ComImport, Guid("d22108aa-8ac5-49a5-837b-37bbb3d7591e"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IUIAutomationElement
{
    void _SetFocus(); void _GetRuntimeId(); void _FindFirst(); void _FindAll();
    void _FindFirstBuildCache(); void _FindAllBuildCache(); void _BuildUpdatedCache();

    [return: MarshalAs(UnmanagedType.Struct)]
    object GetCurrentPropertyValue(int propertyId);
}

internal static class UiaIds
{
    public static readonly Guid CUIAutomation = new("ff48dba4-60ef-4201-aa87-54103eef594e");
    public const int ProcessId = 30002;
    public const int AutomationId = 30011;
    public const int AriaRole = 30101;
    public const int LiveSetting = 30135;
}
