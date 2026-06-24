import { Children, isValidElement } from "react";

const LEAF_DECORATION = "/images/minitree.png";

function getActionRole(className = "") {
  if (className.includes("primary-btn") || className.includes("payment-flow-btn")) {
    return "primary";
  }

  if (className.includes("secondary-btn")) {
    return "secondary";
  }

  return "default";
}

function getLeafFlip(className = "", role) {
  if (className.includes("payment-flow-btn--leaf-left")) {
    return true;
  }

  if (className.includes("payment-flow-btn--leaf-right")) {
    return false;
  }

  return role === "secondary";
}

function PaymentFlowActions({ children, split = false, showLeafDecoration = false }) {
  const wrappedChildren = Children.map(children, (child) => {
    if (!showLeafDecoration || !isValidElement(child)) {
      return child;
    }

    const className = child.props.className || "";
    const role = getActionRole(className);
    const bothLeaves = className.includes("payment-flow-btn--leaf-both");
    const leafFlip = getLeafFlip(className, role);

    return (
      <div
        className={[
          "payment-flow-action-decor",
          split && "payment-flow-action-decor--split",
          bothLeaves && "payment-flow-action-decor--both-leaves",
          role === "primary" && "payment-flow-action-decor--primary",
          role === "secondary" && "payment-flow-action-decor--secondary",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {bothLeaves ? (
          <>
            <img
              className="payment-flow-action-decor__leaf payment-flow-action-decor__leaf--start"
              src={LEAF_DECORATION}
              alt=""
              aria-hidden="true"
            />
            <img
              className="payment-flow-action-decor__leaf payment-flow-action-decor__leaf--end payment-flow-action-decor__leaf--flip"
              src={LEAF_DECORATION}
              alt=""
              aria-hidden="true"
            />
          </>
        ) : (
          <img
            className={[
              "payment-flow-action-decor__leaf",
              leafFlip && "payment-flow-action-decor__leaf--flip",
            ]
              .filter(Boolean)
              .join(" ")}
            src={LEAF_DECORATION}
            alt=""
            aria-hidden="true"
          />
        )}
        {child}
      </div>
    );
  });

  return (
    <div className="payment-flow-actions-wrap">
      <div
        className={[
          "payment-flow-actions",
          split && "payment-flow-actions--split",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {wrappedChildren}
      </div>
    </div>
  );
}

export default PaymentFlowActions;
