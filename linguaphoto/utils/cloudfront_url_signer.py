"""This module provides a class to generate signed URLs for AWS CloudFront using RSA keys.

The `CloudFrontUrlSigner` class allows you to create and sign CloudFront URLs with optional custom policies.
"""

import json
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import rsa
from botocore.signers import CloudFrontSigner


class CloudFrontUrlSigner:
    """A class to generate signed URLs for AWS CloudFront using RSA keys."""

    def __init__(self, key_id: str, private_key_path: str) -> None:
        """Initialize the CloudFrontUrlSigner with a key ID and the path to the private key file.

        :param key_id: The CloudFront key ID associated with the public key in your CloudFront key group.
        :param private_key_path: The path to the private key PEM file.
        """
        self.key_id = key_id
        self.private_key_path = private_key_path
        self.cf_signer = CloudFrontSigner(key_id, self._rsa_signer)

    def _rsa_signer(self, message: str) -> bytes:
        """RSA signer function that signs a message using the private key.

        :param message: The message to be signed.
        :return: The RSA signature of the message as bytes.
        """
        with open(self.private_key_path, "r") as key_file:
            private_key = key_file.read()
        return rsa.sign(
            message.encode("utf8"),  # Ensure message is in bytes
            rsa.PrivateKey.load_pkcs1(private_key.encode("utf8")),
            "SHA-1",  # CloudFront requires SHA-1 hash
        )

    def generate_presigned_url(self, url: str, policy: Optional[str] = None) -> str:
        """Generate a presigned URL for CloudFront using an optional custom policy.

        :param url: The URL to sign.
        :param policy: (Optional) A custom policy for the URL.
        :return: The signed URL.
        """
        return self.cf_signer.generate_presigned_url(url, policy=policy)

    def create_custom_policy(self, url: str, expire_days: int = 1, ip_range: Optional[str] = None) -> str:
        """Create a custom policy for CloudFront signed URLs.

        :param url: The URL to be signed.
        :param expire_days: Number of days until the policy expires.
        :param ip_range: Optional IP range to restrict access.
        :return: The custom policy in JSON format.
        """
        expiration_time = int((datetime.utcnow() + timedelta(days=expire_days)).timestamp())
        policy: Dict[str, Any] = {
            "Statement": [
                {
                    "Resource": url,
                    "Condition": {
                        "DateLessThan": {"AWS:EpochTime": expiration_time},
                    },
                }
            ]
        }
        if ip_range:
            policy["Statement"][0]["Condition"]["IpAddress"] = {"AWS:SourceIp": ip_range}

        return json.dumps(policy, separators=(",", ":"))  # Minified JSON


# Example usage:
# key_id = 'your_cloudfront_key_id'
# private_key_path = 'path/to/your/private_key.pem'
# url = 'https://your-distribution.cloudfront.net/your-file'
# my_policy = None  # Replace with your custom policy if needed

# signer = CloudFrontUrlSigner(key_id, private_key_path)
# signed_url = signer.generate_presigned_url(url, policy=my_policy)
# print(signed_url)
