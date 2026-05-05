from flask import Blueprint, jsonify, g
from app.core.security import require_role
from app.services.notification_service import (
    get_user_notifications,
    get_unread_count,
    mark_read,
    mark_all_read,
    delete_notification
)
from app.schemas.notification import NotificationResponse

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/", methods=["GET"])
@require_role(["patient", "doctor", "admin"])
def get_my_notifications():
    """Get current user's notifications (works for all roles)."""
    user_id = int(g.current_user["sub"])
    notifications = get_user_notifications(user_id)
    unread = get_unread_count(user_id)

    data = [
        NotificationResponse.model_validate(n).model_dump(mode="json")
        for n in notifications
    ]

    return jsonify({"notifications": data, "unread_count": unread}), 200


@notifications_bp.route("/unread-count", methods=["GET"])
@require_role(["patient", "doctor", "admin"])
def get_unread():
    """Quick endpoint to get just the unread count (for badge)."""
    user_id = int(g.current_user["sub"])
    count = get_unread_count(user_id)
    return jsonify({"unread_count": count}), 200


@notifications_bp.route("/<int:notification_id>/read", methods=["PATCH"])
@require_role(["patient", "doctor", "admin"])
def mark_notification_read(notification_id):
    """Mark a single notification as read."""
    user_id = int(g.current_user["sub"])
    success = mark_read(notification_id, user_id)
    if not success:
        return jsonify({"msg": "Notification not found or unauthorized"}), 404
    return jsonify({"msg": "Marked as read"}), 200


@notifications_bp.route("/read-all", methods=["PATCH"])
@require_role(["patient", "doctor", "admin"])
def mark_all_notifications_read():
    """Mark all notifications as read for the current user."""
    user_id = int(g.current_user["sub"])
    count = mark_all_read(user_id)
    return jsonify({"msg": f"Marked {count} notifications as read"}), 200


@notifications_bp.route("/<int:notification_id>", methods=["DELETE"])
@require_role(["patient", "doctor", "admin"])
def delete_user_notification(notification_id):
    """Delete a single notification."""
    user_id = int(g.current_user["sub"])
    success = delete_notification(notification_id, user_id)
    if not success:
        return jsonify({"msg": "Notification not found or unauthorized"}), 404
    return jsonify({"msg": "Notification deleted"}), 200
