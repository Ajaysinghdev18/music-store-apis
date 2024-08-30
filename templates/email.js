const BACKEND_URL = process.env.BACKEND_URL;

const FORGOT_PASSWORD_EMAIL_TEMPLATE = {
  subject: "Forgot Password",
  content: `
    <div style="background-image:url('${BACKEND_URL}/images/background.png'); background-position: center; background-size: cover; width: 596px; height: 650px; margin:0!important;padding:0!important;box-sizing:border-box;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
          <tbody>
          <tr>
            <td align="center" valign="top" style="padding:20px 0 0 0;!important;">
              <img src="${BACKEND_URL}/icons/white_logo.svg"/>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
          <tbody>
          <tr>
            <td align="center" valign="top" style="padding:65px 0 0 0;!important;">
              <img style = "width:128px; height:128px;" src="${BACKEND_URL}/images/reset.png"/>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0"
         align="center" style="margin: 30px 0;" >
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px" role="presentation">
          <tbody>
          <tr>
            <td align="center" >
              <div style="max-width:460px;font-family: arial,sans-serif;">
                <h1 style="font-size:24px;line-height:30px;color:#00FFFF;margin:0 0 8px 0;font-weight:bold">
                  <span>Changing your Account password</span>
                </h1>
                <p style="font-size:16px;line-height:21px;color:#FFFFFF;margin:0;">
                  <span>Need to reset your password?<br/>No problem, just click below to get started.</span>
                </p>

              </div>
              <div style="margin: 32px 0 0 0; ">
                <a style="color:black; margin:0; display: inline-block; cursor:pointer;text-decoration: unset;background: #00FFFF; padding:10px 28px;font-size: 16px;" href="{:resetPasswordUrl}">Reset my password</a>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <div style="width:100%;max-width:640px;text-align:center;padding:0 15px;">
          <p style="margin:0 0 0 0;line-height:23px;font-size:16px;font-family:arial,sans-serif;color:#ffffff;">
            <span>If you didn’t request a password reset,<br/>you can ignore this message.</span>
          </p>
          <p style="margin:48px 0 0 0;line-height:23px;font-size:12px;font-family:arial,sans-serif;color:#ffffff;">
            <span>Music Store Ltd</span>
          </p>
          <img style="margin:24px 0 0 0;" src="${BACKEND_URL}/icons/logo.svg"/>
        </div>
      </td>
    </tr>
    </tbody>
  </table>
</div>
  `,
};

const CREATE_ACCOUNT_HAS_TOKEN_TEMPLATE = {
  subject: "Create Account Has Token",
  content: `
  <div style="background-image:url('${BACKEND_URL}/images/background.png'); background-position: center; background-size: cover; width: 596px; height: 650px; margin:0!important;padding:0!important;box-sizing:border-box;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
        <tr>
            <td align="center" valign="top">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
                    <tbody>
                    <tr>
                        <td align="center" valign="top" style="padding:20px 0 0 0;!important;">
                            <img src="${BACKEND_URL}/icons/white_logo.svg"/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        </tbody>
    </table>
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
        <tr>
            <td align="center" valign="top">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
                    <tbody>
                    <tr>
                        <td align="center" valign="top" style="padding:65px 0 0 0;!important;">
                            <img style = "width:128px; height:128px;" src="${BACKEND_URL}/images/verify.png"/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        </tbody>
    </table>
    <table width="100%" border="0" cellpadding="0" cellspacing="0"
           align="center" style="padding: 30px 0;" >
        <tbody>
        <tr>
            <td align="center" valign="top">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px" role="presentation">
                    <tbody>
                    <tr>
                        <td align="center" >
                            <div style="max-width:460px;font-family: arial,sans-serif;">
                                <h1 style="font-size:24px;line-height:30px;color:#00FFFF;margin:0 0 15px 0;font-weight:bold">
                                    <span>Verify your email address</span>
                                </h1>
                                <p style="font-size:16px;line-height:21px;color:#FFFFFF;margin:0 0 8px 0;">
                                    <span>Hello Jane Doe!<br/>To start accessing Music Store, we need to verify your email ID</span>
                                </p>
                                <a style="margin:0;line-height:21px;font-size:16px;font-family:arial,sans-serif;color:#00FFFF;">
                                    EmailAddress
                                </a>
                            </div>
                        <div style="margin:48px 0 0 0; max-width:460px;font-family: arial,sans-serif;">
                            <a style="margin:36px 0  0  0;cursor:pointer;text-decoration: unset;background: #00FFFF; padding:10px 28px;font-size: 16px;" href="{:verify}">Click to Verify </a>
                        </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        </tbody>
    </table>
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
        <tr>
            <td align="center" valign="top">
                <div style="width:100%;max-width:640px;text-align:center;padding:32px 15px;">
                    <p style="margin:0;line-height:23px;font-size:12px;font-family:arial,sans-serif;color:#ffffff;">
                        <span>Music Store Ltd</span>
                    </p>
                    <img style="margin:24px 0 0 0;" src="${BACKEND_URL}/icons/logo.svg"/>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
</div>
`,
};

const CREATE_ACCOUNT_EMAIL_TEMPLATE = {
  subject: "Create Account",
  content: `
    <div style="background-image:url('${BACKEND_URL}/images/background.png'); background-position: center; background-size: cover; width: 596px; height: 650px; margin:0!important;padding:0!important;box-sizing:border-box;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
        <tr>
          <td align="center" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
              <tbody>
              <tr>
                <td align="center" valign="top" style="padding:20px 0 0 0;!important;">
                  <img src="${BACKEND_URL}/icons/white_logo.svg"/>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
        <tr>
          <td align="center" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
              <tbody>
              <tr>
                <td align="center" valign="top" style="padding:65px 0 0 0;!important;">
                  <img src="${BACKEND_URL}/icons/account.svg"/>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0"
             align="center" style="padding: 30px 0;" >
        <tbody>
        <tr>
          <td align="center" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px" role="presentation">
              <tbody>
              <tr>
                <td align="center" >
                  <div style="max-width:460px;font-family: arial,sans-serif;">
                    <h1 style="font-size:24px;line-height:30px;color:#00FFFF;margin:0 0 15px 0;font-weight:bold">
                      <span>Your new account</span>
                    </h1>
                    <p style="font-size:16px;line-height:21px;color:#FFFFFF;margin:0 0 8px 0;">
                      <span>Hello Jane Doe!<br/>Your new account has successfully created by the admin.</span>
                    </p>
                    <p style="margin: 36px 0 0 0;line-height:21px;font-size:16px;font-family:arial,sans-serif;color:#FFFFFF;">
                      This email has been sent to:
                    </p>
                    <a style="margin:0;line-height:21px;font-size:16px;font-family:arial,sans-serif;color:#00FFFF;">
                      EmailAddress
                    </a>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
        <tr>
          <td align="center" valign="top">
            <div style="width:100%;max-width:640px;margin:0 auto;text-align:center;padding:30px 15px;">
              <p style="margin:0;line-height:23px;font-size:12px;font-family:arial,sans-serif;color:#ffffff;">
                <span>Music Store Ltd</span>
              </p>
              <img style="margin:48px 0 0 0;" src="${BACKEND_URL}/icons/logo.svg"/>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
};

const CREATE_GALLERY_EMAIL_TEMPLATE = {
  subject: "Create Gallery",
  content: `
  <div style="background-image:url('${BACKEND_URL}/images/background.png'); background-position: center; background-size: cover; width: 596px; height: 650px; margin:0!important;padding:0!important;box-sizing:border-box;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
          <tbody>
          <tr>
            <td align="center" valign="top" style="padding:20px 0 0 0;!important;">
              <img src="${BACKEND_URL}/icons/white_logo.svg"/>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
          <tbody>
          <tr>
            <td align="center" valign="top" style="padding:65px 0 0 0;!important;">
              <img  style = "width:128px; height:128px;" src="${BACKEND_URL}/images/gallery.png"/>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0"
         align="center" style="padding: 30px 0;" >
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px" role="presentation">
          <tbody>
          <tr>
            <td align="center" >
              <div style="max-width:460px;font-family: arial,sans-serif;">
                <h1 style="font-size:24px;line-height:30px;color:#00FFFF;margin:0 0 15px 0;font-weight:bold">
                  <span>New gallery</span>
                </h1>
                <p style="font-size:16px;line-height:21px;color:#FFFFFF;margin:0 0 8px 0;">
                  <span>Hello Jane Doe!<br/>A new gallery has been created for you.</span>
                </p>
                <p style="margin: 36px 0 0 0;line-height:21px;font-size:16px;font-family:arial,sans-serif;color:#FFFFFF;">
                  This email has been sent to:
                </p>
                <a style="margin:0;line-height:21px;font-size:16px;font-family:arial,sans-serif;color:#00FFFF;">
                  EmailAddress
                </a>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <div style="width:100%;max-width:640px;margin:0 auto;text-align:center;padding:30px 15px;">
          <p style="margin:0;line-height:23px;font-size:12px;font-family:arial,sans-serif;color:#ffffff;">
            <span>Music Store Ltd</span>
          </p>
          <img style="margin:48px 0 0 0;" src="${BACKEND_URL}/icons/logo.svg"/>
        </div>
      </td>
    </tr>
    </tbody>
  </table>
</div>

  `,
};

const CREATE_PRODUCT_EMAIL_TEMPLATE = {
  subject: "Create Product",
  content: `
  <div style="background-image:url('${BACKEND_URL}/images/background.png'); background-position: center; background-size: cover; width: 596px; height: 650px; margin:0!important;padding:0!important;box-sizing:border-box;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
          <tbody>
          <tr>
            <td align="center" valign="top" style="padding:20px 0 0 0;!important;">
              <img  src="${BACKEND_URL}/icons/white_logo.svg"/>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
          <tbody>
          <tr>
            <td align="center" valign="top" style="padding:65px 0 0 0;!important;">
              <img style = "width:128px; height:128px;" src="${BACKEND_URL}/images/product.png"/>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0"
         align="center" style="padding: 30px 0;" >
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px" role="presentation">
          <tbody>
          <tr>
            <td align="center" >
              <div style="max-width:460px;font-family: arial,sans-serif;">
                <h1 style="font-size:24px;line-height:30px;color:#00FFFF;margin:0 0 15px 0;font-weight:bold">
                  <span>New NFT product</span>
                </h1>
                <p style="font-size:16px;line-height:21px;color:#FFFFFF;margin:0 0 8px 0;">
                  <span>Hello Jane Doe!<br/>A new NFT product has been created for you.</span>
                </p>
                <p style="margin: 36px 0 0 0;line-height:21px;font-size:16px;font-family:arial,sans-serif;color:#FFFFFF;">
                  This email has been sent to:
                </p>
                <a style="margin:0;line-height:21px;font-size:16px;font-family:arial,sans-serif;color:#00FFFF;">
                  EmailAddress
                </a>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <div style="width:100%;max-width:640px;margin:0 auto;text-align:center;padding:30px 15px;">
          <p style="margin:0;line-height:23px;font-size:12px;font-family:arial,sans-serif;color:#ffffff;">
            <span>Music Store Ltd</span>
          </p>
          <img style="margin:48px 0 0 0;" src="${BACKEND_URL}/icons/logo.svg"/>
        </div>
      </td>
    </tr>
    </tbody>
  </table>
</div>

  `,
};

const CREATE_ORDER_EMAIL_TEMPLATE = {
  subject: "Congratulation",
  content: `
    <div
      style="
        background-image: url('${BACKEND_URL}/images/background.png');
        background-position: center;
        background-size: cover;
        width: 596px;
        height: 750px;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box;
      "
    >
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style="padding:20px 0 0 0;!important;"
                    >
                      <img
                        src="${BACKEND_URL}/icons/white_logo.svg"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style="padding: 40px 0 0 0 !important"
                    >
                      <img
                        style="width: 128px; height: 128px"
                        src="${BACKEND_URL}/images/order.png"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table
        width="100%"
        border="0"
        cellpadding="0"
        cellspacing="0"
        align="center"
        style="padding: 30px 0"
      >
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td align="center">
                      <div
                        style="max-width: 460px; font-family: arial, sans-serif"
                      >
                        <span
                          style="
                            font-size: 24px;
                            line-height: 30px;
                            color: #00ffff;
                            margin: 0 0 15px 0;
                            font-weight: bold;
                          "
                        >
                          <span>Congratulations!</span>
                        </span>
                        <p
                          style="font-size: 16px; line-height: 21px; color: #ffffff; margin: 0 0 8px 0"
                        >
                          <span
                            >You have successfully purchased your order</span
                          >
                        </p>
                        <p
                          style="font-size: 16px; line-height: 21px; color: #00ffff; margin: 28px 0 12px 0"
                        >
                          <span>Delivered order details</span>
                        </p>
                        <table
                          style="color: #fff; font-size: 12px; width: 250px; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #fff"
                        >
                          <tbody>
                            <tr>
                              <td style="text-align: left; opacity: 0.5">
                                Order code:
                              </td>
                              <td style="text-align: right">OrderCode</td>
                            </tr>
                            <tr>
                              <td style="text-align: left; opacity: 0.5">
                                Order date:
                              </td>
                              <td style="text-align: right">OrderDate</td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          style="color: #fff; font-size: 12px; width: 250px; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #fff"
                        >
                          <tbody>
                            <tr>
                              <td style="text-align: left; opacity: 0.5">
                                Delivery date:
                              </td>
                              <td style="text-align: right">DeliveryDate</td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          style="color: #fff; font-size: 12px; width: 250px"
                        >
                          <tbody>
                            <tr>
                              <td style="text-align: left; opacity: 0.5">
                                Payment method:
                              </td>
                              <td style="text-align: right">PaymentMethod</td>
                            </tr>
                            <tr>
                              <td style="text-align: left; opacity: 0.5">
                                Total Amount:
                              </td>
                              <td style="text-align: right">TotalAmount</td>
                            </tr>
                          </tbody>
                        </table>
                        <p
                          style="
                            margin: 36px 0 8px 0;
                            line-height: 21px;
                            font-size: 16px;
                            font-family: arial, sans-serif;
                            color: #ffffff;
                          "
                        >
                          Your order is processing and shortly will be in your
                          inbox at:
                        </p>
                        <a
                          href="#"
                          style="
                            margin: 0;
                            line-height: 21px;
                            font-size: 16px;
                            font-family: arial, sans-serif;
                            color: #00ffff !important;
                          "
                        >
                          EmailAddress
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <div
                style="margin: 0 auto; text-align: center; padding: 0 15px 30px"
              >
                <p
                  style="margin: 0; line-height: 23px; font-size: 12px; font-family: arial, sans-serif; color: #ffffff"
                >
                  <span
                    >Music Store Ltd • 569 Yates St. • Victoria, BC V8W8K8,
                    Canada</span
                  >
                </p>
                <img
                  style="margin: 48px 0 0 0"
                  src="${BACKEND_URL}/icons/logo.svg"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    `,
};

const CREATE_CONTRACT_EMAIL_TEMPLATE = {
  subject: "",
  content: `
      <div style="background-image:url('${BACKEND_URL}/images/background.png'); background-position: center; background-size: cover; width: 596px; height: 650px; margin:0!important;padding:0!important;box-sizing:border-box;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
          <tbody>
          <tr>
            <td align="center" valign="top" style="padding:20px 0 0 0;!important;">
              <img src="${BACKEND_URL}/icons/white_logo.svg"/>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;" role="presentation">
          <tbody>
          <tr>
            <td align="center" valign="top" style="padding:65px 0 0 0;!important;">
              <img style = "width:128px; height:128px;" src="${BACKEND_URL}/images/smart.png"/>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0"
         align="center" style="padding: 30px 0;" >
    <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px" role="presentation">
          <tbody>
          <tr>
            <td align="center" >
              <div style="max-width:460px;font-family: arial,sans-serif;">
                <h1 style="font-size:24px;line-height:30px;color:#00FFFF;margin:0 0 15px 0;font-weight:bold">
                  <span>New smart contract</span>
                </h1>
                <p style="font-size:16px;line-height:21px;color:#FFFFFF;margin:0 0 8px 0;">
                  <span>Hello Jane Doe!<br/>A new smart contract has been created for you.</span>
                </p>
                <p style="margin: 36px 0 0 0;line-height:21px;font-size:16px;font-family:arial,sans-serif;color:#FFFFFF;">
                  This email has been sent to:
                </p>
                <a style="margin:0;line-height:21px;font-size:16px;font-family:arial,sans-serif;color:#00FFFF;">
                  EmailAddress
                </a>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
    </tbody>
  </table>
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
      <td align="center" valign="top">
        <div style="width:100%;max-width:640px;margin:0 auto;text-align:center;padding:30px 15px;">
          <p style="margin:0;line-height:23px;font-size:12px;font-family:arial,sans-serif;color:#ffffff;">
            <span>Music Store Ltd</span>
          </p>
          <img style="margin:48px 0 0 0;" src="${BACKEND_URL}/icons/logo.svg"/>
        </div>
      </td>
    </tr>
    </tbody>
  </table>
</div>

    `,
};

const KYC_REJECTED_TEMPLATE = {
  subject: "KYC Rejected",
  content: `
    <div
      style="
        background-image: url('${BACKEND_URL}/images/background.png');
        background-position: center;
        background-size: cover;
        width: 596px;
        height: 750px;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box;
      "
    >
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style="padding:20px 0 0 0;!important;"
                    >
                      <img
                        src="${BACKEND_URL}/icons/white_logo.svg"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style="padding: 40px 0 0 0 !important"
                    >
                      <img
                        style="width: 128px; height: 128px"
                        src="${BACKEND_URL}/images/order.png"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table
        width="100%"
        border="0"
        cellpadding="0"
        cellspacing="0"
        align="center"
        style="padding: 30px 0"
      >
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td align="center">
                      <div
                        style="max-width: 460px; font-family: arial, sans-serif"
                      >
                        <span
                          style="
                            font-size: 24px;
                            line-height: 30px;
                            color: #00ffff;
                            margin: 0 0 15px 0;
                            font-weight: bold;
                          "
                        >
                          <span>Alert!</span>
                        </span>
                        <p
                          style="font-size: 16px; line-height: 21px; color: #ffffff; margin: 0 0 8px 0"
                        >
                          <span
                            >Your KYC has been Rejected Please Reverify your account.</span
                          >
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <div
                style="margin: 0 auto; text-align: center; padding: 0 15px 30px"
              >
                <p
                  style="margin: 0; line-height: 23px; font-size: 12px; font-family: arial, sans-serif; color: #ffffff"
                >
                  <span
                    >Music Store Ltd • 569 Yates St. • Victoria, BC V8W8K8,
                    Canada</span
                  >
                </p>
                <img
                  style="margin: 48px 0 0 0"
                  src="${BACKEND_URL}/icons/logo.svg"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    `,
};
const KYC_VERIFIED_TEMPLATE = {
  subject: "Congratulation",
  content: `
    <div
      style="
        background-image: url('${BACKEND_URL}/images/background.png');
        background-position: center;
        background-size: cover;
        width: 596px;
        height: 750px;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box;
      "
    >
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style="padding:20px 0 0 0;!important;"
                    >
                      <img
                        src="${BACKEND_URL}/icons/white_logo.svg"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style="padding: 40px 0 0 0 !important"
                    >
                      <img
                        style="width: 128px; height: 128px"
                        src="${BACKEND_URL}/images/order.png"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table
        width="100%"
        border="0"
        cellpadding="0"
        cellspacing="0"
        align="center"
        style="padding: 30px 0"
      >
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td align="center">
                      <div
                        style="max-width: 460px; font-family: arial, sans-serif"
                      >
                        <span
                          style="
                            font-size: 24px;
                            line-height: 30px;
                            color: #00ffff;
                            margin: 0 0 15px 0;
                            font-weight: bold;
                          "
                        >
                          <span>Congratulations!</span>
                        </span>
                        <p
                          style="font-size: 16px; line-height: 21px; color: #ffffff; margin: 0 0 8px 0"
                        >
                          <span
                            >Your KYC has been Successfully verified</span
                          >
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <div
                style="margin: 0 auto; text-align: center; padding: 0 15px 30px"
              >
                <p
                  style="margin: 0; line-height: 23px; font-size: 12px; font-family: arial, sans-serif; color: #ffffff"
                >
                  <span
                    >Music Store Ltd • 569 Yates St. • Victoria, BC V8W8K8,
                    Canada</span
                  >
                </p>
                <img
                  style="margin: 48px 0 0 0"
                  src="${BACKEND_URL}/icons/logo.svg"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    `,
};
const KYC_UNDER_VERIFICATION_TEMPLATE = {
  subject: "Congratulation",
  content: `
    <div
      style="
        background-image: url('${BACKEND_URL}/images/background.png');
        background-position: center;
        background-size: cover;
        width: 596px;
        height: 750px;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box;
      "
    >
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style="padding:20px 0 0 0;!important;"
                    >
                      <img
                        src="${BACKEND_URL}/icons/white_logo.svg"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style="padding: 40px 0 0 0 !important"
                    >
                      <img
                        style="width: 128px; height: 128px"
                        src="${BACKEND_URL}/images/order.png"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table
        width="100%"
        border="0"
        cellpadding="0"
        cellspacing="0"
        align="center"
        style="padding: 30px 0"
      >
        <tbody>
          <tr>
            <td align="center" valign="top">
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="max-width: 640px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td align="center">
                      <div
                        style="max-width: 460px; font-family: arial, sans-serif"
                      >
                        <span
                          style="
                            font-size: 24px;
                            line-height: 30px;
                            color: #00ffff;
                            margin: 0 0 15px 0;
                            font-weight: bold;
                          "
                        >
                          <span>Congratulations!</span>
                        </span>
                        <p
                          style="font-size: 16px; line-height: 21px; color: #ffffff; margin: 0 0 8px 0"
                        >
                          <span
                            >Your KYC has been Successfully verified</span
                          >
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tbody>
          <tr>
            <td align="center" valign="top">
              <div
                style="margin: 0 auto; text-align: center; padding: 0 15px 30px"
              >
                <p
                  style="margin: 0; line-height: 23px; font-size: 12px; font-family: arial, sans-serif; color: #ffffff"
                >
                  <span
                    >Music Store Ltd • 569 Yates St. • Victoria, BC V8W8K8,
                    Canada</span
                  >
                </p>
                <img
                  style="margin: 48px 0 0 0"
                  src="${BACKEND_URL}/icons/logo.svg"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    `,
};
module.exports = {
  KYC_REJECTED_TEMPLATE,
  KYC_VERIFIED_TEMPLATE,
  FORGOT_PASSWORD_EMAIL_TEMPLATE,
  CREATE_ACCOUNT_EMAIL_TEMPLATE,
  CREATE_GALLERY_EMAIL_TEMPLATE,
  CREATE_PRODUCT_EMAIL_TEMPLATE,
  CREATE_ORDER_EMAIL_TEMPLATE,
  CREATE_CONTRACT_EMAIL_TEMPLATE,
  CREATE_ACCOUNT_HAS_TOKEN_TEMPLATE,
  KYC_UNDER_VERIFICATION_TEMPLATE,
};
