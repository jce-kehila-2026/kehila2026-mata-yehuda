import { STAFF_NAVIGATION_GROUPS } from "../../config/staffNavigationGroups";
import { getStaffSection } from "../../utils/staffManegmentUtils/staffNavigation";

function isStaffNavItemActive(currentPage, actionPage) {
    if (!actionPage) {
        return false;
    }

    return getStaffSection(currentPage) === getStaffSection(actionPage);
}

const NAV_VARIANT_CLASSES = {
    mobile: {
        section: "staff-mobile-menu-section",
        sectionTitle: "staff-mobile-menu-section-title",
        list: "staff-mobile-menu-section-list",
        listTag: "ul",
        item: "staff-mobile-menu-item",
        itemActive: "staff-mobile-menu-item staff-mobile-menu-item--active",
        itemIcon: "staff-mobile-menu-item__icon",
        listItemTag: "li"
    },
    sidebar: {
        section: "staff-dashboard-sidebar-section",
        sectionTitle: "staff-dashboard-sidebar-section-title",
        list: "staff-dashboard-sidebar-section-list",
        listTag: "div",
        item: "staff-dashboard-sidebar-item",
        itemActive:
            "staff-dashboard-sidebar-item staff-dashboard-sidebar-item--active",
        itemIcon: "staff-dashboard-sidebar-item__icon",
        listItemTag: "div"
    }
};

function StaffNavigationSections({
    variant,
    groups = STAFF_NAVIGATION_GROUPS,
    actionsById,
    actionIcons,
    currentPage,
    onNavigate,
    onItemActivate
}) {
    const classes = NAV_VARIANT_CLASSES[variant];
    const ListTag = classes.listTag;
    const ListItemTag = classes.listItemTag;

    return groups.map((section) => (
        <section key={section.title} className={classes.section}>
            <h3 className={classes.sectionTitle}>{section.title}</h3>
            <ListTag className={classes.list}>
                {section.itemIds.map((itemId) => {
                    const action = actionsById[itemId];

                    if (!action) {
                        return null;
                    }

                    const ActionIcon = actionIcons[itemId];
                    const isActive = isStaffNavItemActive(
                        currentPage,
                        action.page
                    );

                    return (
                        <ListItemTag key={itemId}>
                            <button
                                type="button"
                                className={
                                    isActive ? classes.itemActive : classes.item
                                }
                                disabled={!action.page}
                                onClick={() => {
                                    if (action.page) {
                                        onNavigate(action.page);
                                        onItemActivate?.();
                                    }
                                }}
                            >
                                {ActionIcon ? (
                                    <ActionIcon
                                        className={classes.itemIcon}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <span>{action.label}</span>
                            </button>
                        </ListItemTag>
                    );
                })}
            </ListTag>
        </section>
    ));
}

export default StaffNavigationSections;
