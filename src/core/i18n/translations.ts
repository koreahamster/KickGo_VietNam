import type { SupportedLanguage } from "@/types/profile.types";

type TranslationTree = {
  common: {
    language: string;
    save: string;
    cancel: string;
    logout: string;
    loading: string;
    home: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      emailButton: string;
      emailButtonLoading: string;
      signupButton: string;
      googleButton: string;
      googleHelper: string;
      validationRequiredEmail: string;
      validationInvalidEmail: string;
      validationPasswordLength: string;
    };
    signup: {
      title: string;
      subtitle: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      signupButton: string;
      signupButtonLoading: string;
      loginButton: string;
      validationRequiredEmail: string;
      validationInvalidEmail: string;
      validationPasswordLength: string;
    };
    phoneVerify: {
      title: string;
      subtitle: string;
      helperCreate: string;
      helperRole: string;
      helperDone: string;
      continueProfile: string;
      continueRole: string;
      goHome: string;
    };
  };
  profile: {
    editCancel: string;
  };
  home: {
    loadingDescription: string;
    guestDescription: string;
    login: string;
    signup: string;
    needProfileDescription: string;
    phoneVerify: string;
    createProfile: string;
    pendingRoleDescription: string;
    continueRoleOnboarding: string;
    profile: string;
    completedDescription: string;
    openProfile: string;
    settings: string;
  };
  profileTab: {
    title: string;
    loadingDescription: string;
    needProfileDescription: string;
    createProfile: string;
    phoneVerify: string;
    name: string;
    email: string;
    language: string;
    region: string;
    roles: string;
    editProfile: string;
    continueRoleOnboarding: string;
    settings: string;
    notSet: string;
  };
  onboarding: {
    createProfile: {
      loadingTitle: string;
      loadingSubtitle: string;
      existingTitle: string;
      existingSubtitle: string;
      continueRole: string;
      goHome: string;
      createTitle: string;
      createSubtitle: string;
      editTitle: string;
      editSubtitle: string;
      displayName: string;
      displayNamePlaceholder: string;
      birthYearOptional: string;
      birthYearPlaceholder: string;
      country: string;
      countryValue: string;
      countryHelper: string;
      province: string;
      selectProvince: string;
      district: string;
      selectDistrict: string;
      language: string;
      languageHelper: string;
      initialRole: string;
      chooseRole: string;
      bioOptional: string;
      bioPlaceholder: string;
      requiredConsents: string;
      privacyTitle: string;
      privacyDescription: string;
      marketingTitle: string;
      marketingDescription: string;
      saveCreate: string;
      saveEdit: string;
      saveLoading: string;
      continueExisting: string;
      validationDisplayName: string;
      validationBirthYear: string;
      validationRegion: string;
      validationRole: string;
      validationPrivacy: string;
    };
    roleOnboarding: {
      title: string;
      subtitle: string;
      needCommonProfile: string;
      needCommonProfileHelper: string;
      moveToCommonProfile: string;
      playerSection: string;
      preferredPosition: string;
      selectPosition: string;
      preferredFoot: string;
      selectPreferredFoot: string;
      dominantFoot: string;
      selectDominantFoot: string;
      topSizeOptional: string;
      selectTopSize: string;
      shoeSizeOptional: string;
      selectShoeSize: string;
      none: string;
      savePlayer: string;
      saveLoading: string;
      playerValidation: string;
      refereeSection: string;
      refereeHelper: string;
      createReferee: string;
      facilityManagerSection: string;
      facilityManagerHelper: string;
      completedSection: string;
      completedHelper: string;
      goHome: string;
    };
  };
  settings: {
    main: {
      title: string;
      loadingSubtitle: string;
      needProfileSubtitle: string;
      needProfileHelper: string;
      continueOnboarding: string;
      goHome: string;
      subtitle: string;
      profileSection: string;
      commonSection: string;
      appSection: string;
      notSet: string;
      visibilityPrefix: string;
      editProfile: string;
      profileVisibility: string;
      language: string;
      region: string;
      roles: string;
      notifications: string;
      account: string;
      versionPrefix: string;
    };
    language: {
      title: string;
      loadingSubtitle: string;
      needProfileSubtitle: string;
      continueOnboarding: string;
      backToSettings: string;
      subtitle: string;
      placeholder: string;
      saving: string;
    };
    region: {
      title: string;
      loadingSubtitle: string;
      needProfileSubtitle: string;
      continueOnboarding: string;
      backToSettings: string;
      subtitle: string;
      country: string;
      countryValue: string;
      helper: string;
      province: string;
      selectProvince: string;
      district: string;
      selectDistrict: string;
      save: string;
      saving: string;
    };
    roles: {
      title: string;
      loadingSubtitle: string;
      needProfileSubtitle: string;
      continueOnboarding: string;
      backToSettings: string;
      subtitle: string;
      currentRoles: string;
      noRoles: string;
      addSuffix: string;
      allAdded: string;
    };
    visibility: {
      title: string;
      loadingSubtitle: string;
      needProfileSubtitle: string;
      continueOnboarding: string;
      backToSettings: string;
      subtitle: string;
      label: string;
      placeholder: string;
      save: string;
      saving: string;
    };
    notifications: {
      title: string;
      subtitle: string;
    };
    account: {
      title: string;
      subtitle: string;
      privacySection: string;
      privacyStatusPrefix: string;
      required: string;
      agreed: string;
      policyVersionPrefix: string;
      recordedAtPrefix: string;
      agreePrivacy: string;
      marketingSection: string;
      marketingTitle: string;
      marketingDescription: string;
      currentStatePrefix: string;
      notAgreed: string;
      saveMarketing: string;
      notRecorded: string;
    };
  };
};

const KO: TranslationTree = {
  common: {
    language: "\uC5B8\uC5B4",
    save: "\uC800\uC7A5",
    cancel: "\uCDE8\uC18C",
    logout: "\uB85C\uADF8\uC544\uC6C3",
    loading: "\uBD88\uB7EC\uC624\uB294 \uC911...",
    home: "\uD648",
  },
  auth: {
    login: {
      title: "\uB85C\uADF8\uC778",
      subtitle: "\uAC00\uC785\uD55C \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778\uD558\uACE0 \uC628\uBCF4\uB529\uC744 \uACC4\uC18D \uC9C4\uD589\uD558\uC138\uC694.",
      emailPlaceholder: "\uC774\uBA54\uC77C \uC8FC\uC18C",
      passwordPlaceholder: "\uBE44\uBC00\uBC88\uD638",
      emailButton: "\uC774\uBA54\uC77C\uB85C \uB85C\uADF8\uC778",
      emailButtonLoading: "\uB85C\uADF8\uC778 \uC911...",
      signupButton: "\uD68C\uC6D0\uAC00\uC785",
      googleButton: "Google\uB85C \uACC4\uC18D\uD558\uAE30",
      googleHelper: "Google \uB85C\uADF8\uC778\uC740 \uC720\uC9C0\uB418\uC9C0\uB9CC Expo Go\uC5D0\uC11C\uB294 \uC571 \uBCF5\uADC0 \uAC80\uC99D\uC774 \uC81C\uD55C\uB429\uB2C8\uB2E4.",
      validationRequiredEmail: "\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
      validationInvalidEmail: "\uC62C\uBC14\uB978 \uC774\uBA54\uC77C \uD615\uC2DD\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
      validationPasswordLength: "\uBE44\uBC00\uBC88\uD638\uB294 6\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.",
    },
    signup: {
      title: "\uD68C\uC6D0\uAC00\uC785",
      subtitle: "KickGo \uACC4\uC815\uC744 \uB9CC\uB4E4\uACE0 Phase 2 \uC628\uBCF4\uB529\uC744 \uC2DC\uC791\uD558\uC138\uC694.",
      emailPlaceholder: "\uC774\uBA54\uC77C \uC8FC\uC18C",
      passwordPlaceholder: "\uBE44\uBC00\uBC88\uD638",
      signupButton: "\uC774\uBA54\uC77C\uB85C \uD68C\uC6D0\uAC00\uC785",
      signupButtonLoading: "\uAC00\uC785 \uC911...",
      loginButton: "\uB85C\uADF8\uC778",
      validationRequiredEmail: "\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
      validationInvalidEmail: "\uC62C\uBC14\uB978 \uC774\uBA54\uC77C \uD615\uC2DD\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
      validationPasswordLength: "\uBE44\uBC00\uBC88\uD638\uB294 6\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.",
    },
    phoneVerify: {
      title: "\uC804\uD654\uBC88\uD638 \uC778\uC99D",
      subtitle: "\uBB38\uC11C \uAE30\uC900 \uD750\uB984\uC5D0 \uB9DE\uCDB0 \uC804\uD654\uBC88\uD638 \uC778\uC99D \uB2E8\uACC4\uB97C \uBA3C\uC800 \uD655\uC778\uD569\uB2C8\uB2E4.",
      helperCreate: "\uD604\uC7AC MVP\uC5D0\uC11C\uB294 \uC2E4\uC81C SMS \uC778\uC99D \uB300\uC2E0 \uB2E4\uC74C \uC628\uBCF4\uB529 \uB2E8\uACC4\uB85C \uC815\uC0C1 \uC5F0\uACB0\uB418\uB294\uC9C0 \uBA3C\uC800 \uD655\uC778\uD569\uB2C8\uB2E4.",
      helperRole: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uC774\uBBF8 \uC788\uC2B5\uB2C8\uB2E4. \uB0A8\uC544 \uC788\uB294 \uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529\uC744 \uC774\uC5B4\uC11C \uC9C4\uD589\uD558\uC138\uC694.",
      helperDone: "\uACF5\uD1B5 \uD504\uB85C\uD544\uACFC \uC5ED\uD560 \uC628\uBCF4\uB529\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD648\uC73C\uB85C \uC774\uB3D9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      continueProfile: "\uACF5\uD1B5 \uD504\uB85C\uD544\uB85C \uACC4\uC18D",
      continueRole: "\uC5ED\uD560 \uC628\uBCF4\uB529 \uACC4\uC18D",
      goHome: "\uD648\uC73C\uB85C \uC774\uB3D9",
    },
  },
  profile: {
    editCancel: "\uC218\uC815 \uCDE8\uC18C",
  },
  home: {
    loadingDescription: "\uACC4\uC815 \uC0C1\uD0DC\uC640 \uC628\uBCF4\uB529 \uC9C4\uD589 \uC5EC\uBD80\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
    guestDescription: "\uD300 \uC6B4\uC601\uBD80\uD130 \uACBD\uAE30 \uAE30\uB85D\uAE4C\uC9C0, \uC544\uB9C8\uCD94\uC5B4 \uD48B\uBCFC \uAD00\uB9AC\uB97C \uD55C\uACF3\uC5D0\uC11C \uAC04\uD3B8\uD558\uAC8C.",
    login: "\uB85C\uADF8\uC778",
    signup: "\uD68C\uC6D0\uAC00\uC785",
    needProfileDescription: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uC544\uC9C1 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uB2E8\uACC4\uB97C \uC9C4\uD589\uD574 \uC8FC\uC138\uC694.",
    phoneVerify: "\uC804\uD654\uBC88\uD638 \uC778\uC99D",
    createProfile: "\uACF5\uD1B5 \uD504\uB85C\uD544 \uC124\uC815",
    pendingRoleDescription: "\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529\uC774 \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4. \uD544\uC694\uD55C \uCD94\uAC00 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uBA74 \uD648\uC73C\uB85C \uB118\uC5B4\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    continueRoleOnboarding: "\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529 \uACC4\uC18D",
    profile: "\uD504\uB85C\uD544",
    completedDescription: "\uD658\uC601\uD569\uB2C8\uB2E4. \uACF5\uD1B5 \uD504\uB85C\uD544\uACFC \uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    openProfile: "\uD504\uB85C\uD544\uB85C \uC774\uB3D9",
    settings: "\uC124\uC815",
  },
  profileTab: {
    title: "\uD504\uB85C\uD544",
    loadingDescription: "\uD504\uB85C\uD544 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
    needProfileDescription: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC744 \uBA3C\uC800 \uC644\uC131\uD558\uBA74 \uC124\uC815\uACFC \uD504\uB85C\uD544 \uC815\uBCF4\uB97C \uAD00\uB9AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    createProfile: "\uACF5\uD1B5 \uD504\uB85C\uD544 \uC124\uC815",
    phoneVerify: "\uC804\uD654\uBC88\uD638 \uC778\uC99D",
    name: "\uC774\uB984",
    email: "\uC774\uBA54\uC77C",
    language: "\uC5B8\uC5B4",
    region: "\uC9C0\uC5ED",
    roles: "\uC5ED\uD560",
    editProfile: "\uD504\uB85C\uD544 \uAE30\uBCF8 \uC218\uC815",
    continueRoleOnboarding: "\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529 \uACC4\uC18D",
    settings: "\uC124\uC815",
    notSet: "\uBBF8\uC124\uC815",
  },
  onboarding: {
    createProfile: {
      loadingTitle: "\uACF5\uD1B5 \uD504\uB85C\uD544",
      loadingSubtitle: "\uD504\uB85C\uD544\uACFC \uB3D9\uC758 \uC0C1\uD0DC\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      existingTitle: "\uACF5\uD1B5 \uD504\uB85C\uD544",
      existingSubtitle: "\uC774\uBBF8 \uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uC800\uC7A5\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uD544\uC694\uD55C \uB3D9\uC758\uB97C \uD655\uC778\uD558\uACE0 \uB2E4\uC74C \uB2E8\uACC4\uB85C \uC774\uB3D9\uD558\uC138\uC694.",
      continueRole: "\uC5ED\uD560 \uC628\uBCF4\uB529 \uACC4\uC18D",
      goHome: "\uD648\uC73C\uB85C \uC774\uB3D9",
      createTitle: "\uACF5\uD1B5 \uD504\uB85C\uD544 \uC0DD\uC131",
      createSubtitle: "\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529 \uC774\uC804\uC5D0 \uACF5\uD1B5 \uC0AC\uC6A9\uC790 \uC815\uBCF4\uB97C \uBA3C\uC800 \uC800\uC7A5\uD574 \uC8FC\uC138\uC694.",
      editTitle: "\uACF5\uD1B5 \uD504\uB85C\uD544 \uC218\uC815",
      editSubtitle: "Settings\uC5D0\uC11C \uC0AC\uC6A9\uD558\uB294 \uACF5\uD1B5 \uD504\uB85C\uD544 \uC815\uBCF4\uB97C \uC218\uC815\uD569\uB2C8\uB2E4.",
      displayName: "\uD45C\uC2DC \uC774\uB984",
      displayNamePlaceholder: "\uD45C\uC2DC \uC774\uB984",
      birthYearOptional: "\uCD9C\uC0DD \uC5F0\uB3C4 (\uC120\uD0DD)",
      birthYearPlaceholder: "\uC608: 1993",
      country: "\uAD6D\uAC00",
      countryValue: "Vietnam",
      countryHelper: "\uD604\uC7AC MVP\uB294 \uBCA0\uD2B8\uB0A8 \uC9C0\uC5ED \uB370\uC774\uD130\uB9CC \uC9C0\uC6D0\uD569\uB2C8\uB2E4.",
      province: "\uC2DC/\uC131",
      selectProvince: "\uC2DC/\uC131 \uC120\uD0DD",
      district: "\uAD6C/\uAD70",
      selectDistrict: "\uAD6C/\uAD70 \uC120\uD0DD",
      language: "\uC5B8\uC5B4",
      languageHelper: "\uCD08\uAE30 \uC5B8\uC5B4\uB294 \uD604\uC7AC \uC571 \uC5B8\uC5B4\uB97C \uC0AC\uC6A9\uD558\uBA70, \uC774\uD6C4 Settings\uC5D0\uC11C \uBCC0\uACBD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      initialRole: "\uCD08\uAE30 \uC5ED\uD560",
      chooseRole: "\uC5ED\uD560 \uC120\uD0DD",
      bioOptional: "\uC790\uAE30\uC18C\uAC1C (\uC120\uD0DD)",
      bioPlaceholder: "\uAC04\uB2E8\uD55C \uC18C\uAC1C",
      requiredConsents: "\uD544\uC218 \uB3D9\uC758",
      privacyTitle: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68 \uB3D9\uC758",
      privacyDescription: "KickGo \uC11C\uBE44\uC2A4 \uC0AC\uC6A9\uC744 \uC704\uD55C \uD544\uC218 \uB3D9\uC758\uC785\uB2C8\uB2E4.",
      marketingTitle: "\uB9C8\uCF00\uD305 \uC218\uC2E0 \uB3D9\uC758",
      marketingDescription: "\uD504\uB85C\uBAA8\uC158, \uC774\uBCA4\uD2B8, \uC5C5\uB370\uC774\uD2B8 \uC54C\uB9BC\uC744 \uBC1B\uC2B5\uB2C8\uB2E4.",
      saveCreate: "\uACF5\uD1B5 \uD504\uB85C\uD544 \uC800\uC7A5",
      saveEdit: "\uBCC0\uACBD\uC0AC\uD56D \uC800\uC7A5",
      saveLoading: "\uC800\uC7A5 \uC911...",
      continueExisting: "\uACC4\uC18D",
      validationDisplayName: "\uD45C\uC2DC \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
      validationBirthYear: "\uCD9C\uC0DD \uC5F0\uB3C4\uB294 \uC22B\uC790\uB85C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
      validationRegion: "\uC2DC/\uC131\uACFC \uAD6C/\uAD70\uC744 \uBAA8\uB450 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
      validationRole: "\uCD08\uAE30 \uC5ED\uD560\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
      validationPrivacy: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68 \uB3D9\uC758\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.",
    },
    roleOnboarding: {
      title: "\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529",
      subtitle: "\uC120\uD0DD\uD55C \uC5ED\uD560\uC5D0 \uD544\uC694\uD55C \uCD94\uAC00 \uC815\uBCF4\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
      needCommonProfile: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC744 \uBA3C\uC800 \uC644\uC131\uD574\uC57C \uD569\uB2C8\uB2E4.",
      needCommonProfileHelper: "\uACF5\uD1B5 \uC0AC\uC6A9\uC790 \uC815\uBCF4\uB97C \uC800\uC7A5\uD55C \uB4A4 \uC120\uC218/\uC2EC\uD310 \uC628\uBCF4\uB529\uC744 \uC774\uC5B4\uC11C \uC9C4\uD589\uD558\uC138\uC694.",
      moveToCommonProfile: "\uACF5\uD1B5 \uD504\uB85C\uD544\uB85C \uC774\uB3D9",
      playerSection: "\uC120\uC218 \uD504\uB85C\uD544",
      preferredPosition: "\uC120\uD638 \uD3EC\uC9C0\uC158",
      selectPosition: "\uD3EC\uC9C0\uC158 \uC120\uD0DD",
      preferredFoot: "\uC120\uD638 \uBC1C",
      selectPreferredFoot: "\uC120\uD638 \uBC1C \uC120\uD0DD",
      dominantFoot: "\uC8FC \uC0AC\uC6A9 \uBC1C",
      selectDominantFoot: "\uC8FC \uC0AC\uC6A9 \uBC1C \uC120\uD0DD",
      topSizeOptional: "\uC0C1\uC758 \uC0AC\uC774\uC988 (\uC120\uD0DD)",
      selectTopSize: "\uC0AC\uC774\uC988 \uC120\uD0DD",
      shoeSizeOptional: "\uBC1C \uC0AC\uC774\uC988 (\uC120\uD0DD)",
      selectShoeSize: "\uC0AC\uC774\uC988 \uC120\uD0DD",
      none: "\uC120\uD0DD \uC548 \uD568",
      savePlayer: "\uC120\uC218 \uD504\uB85C\uD544 \uC800\uC7A5",
      saveLoading: "\uC800\uC7A5 \uC911...",
      playerValidation: "\uC120\uC218 \uD504\uB85C\uD544 \uD544\uC218 \uD56D\uBAA9\uC744 \uBAA8\uB450 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
      refereeSection: "\uC2EC\uD310 \uD504\uB85C\uD544",
      refereeHelper: "MVP \uB2E8\uACC4\uC5D0\uC11C\uB294 \uCD5C\uC18C \uC2EC\uD310 \uD504\uB85C\uD544\uB9CC \uC0DD\uC131\uD569\uB2C8\uB2E4.",
      createReferee: "\uC2EC\uD310 \uD504\uB85C\uD544 \uC0DD\uC131",
      facilityManagerSection: "\uC2DC\uC124 \uAD00\uB9AC\uC790",
      facilityManagerHelper: "\uC2DC\uC124 \uC5F0\uACB0\uACFC \uC6B4\uC601 \uC0C1\uC138 \uC124\uC815\uC740 \uD6C4\uC18D \uB2E8\uACC4\uC5D0\uC11C \uC9C0\uC6D0\uB429\uB2C8\uB2E4.",
      completedSection: "\uC628\uBCF4\uB529 \uC644\uB8CC",
      completedHelper: "\uB0A8\uC544 \uC788\uB358 \uC5ED\uD560\uBCC4 \uC785\uB825\uC774 \uBAA8\uB450 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
      goHome: "\uD648\uC73C\uB85C \uC774\uB3D9",
    },
  },
  settings: {
    main: {
      title: "\uC124\uC815",
      loadingSubtitle: "\uC124\uC815 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      needProfileSubtitle: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC744 \uBA3C\uC800 \uC644\uB8CC\uD558\uBA74 \uC124\uC815 \uD56D\uBAA9\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      needProfileHelper: "\uD604\uC7AC \uC628\uBCF4\uB529 \uB2E8\uACC4\uC5D0 \uB9DE\uB294 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9\uD574 \uC8FC\uC138\uC694.",
      continueOnboarding: "\uC628\uBCF4\uB529 \uACC4\uC18D",
      goHome: "\uD648\uC73C\uB85C \uC774\uB3D9",
      subtitle: "KickGo v3.1 \uBB38\uC11C \uAE30\uC900 Phase 2 MVP \uACF5\uD1B5 \uC124\uC815 \uD56D\uBAA9\uC785\uB2C8\uB2E4.",
      profileSection: "\uD504\uB85C\uD544",
      commonSection: "\uACF5\uD1B5 \uC124\uC815",
      appSection: "\uC571",
      notSet: "\uBBF8\uC124\uC815",
      visibilityPrefix: "\uACF5\uAC1C \uBC94\uC704",
      editProfile: "\uD504\uB85C\uD544 \uAE30\uBCF8 \uC218\uC815",
      profileVisibility: "\uD504\uB85C\uD544 \uACF5\uAC1C \uBC94\uC704",
      language: "\uC5B8\uC5B4",
      region: "\uC9C0\uC5ED",
      roles: "\uACC4\uC815 \uC5ED\uD560",
      notifications: "\uC54C\uB9BC",
      account: "\uACC4\uC815",
      versionPrefix: "\uBC84\uC804",
    },
    language: {
      title: "\uC5B8\uC5B4",
      loadingSubtitle: "\uD604\uC7AC \uC5B8\uC5B4 \uC124\uC815\uC744 \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      needProfileSubtitle: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uC788\uC5B4\uC57C \uC5B8\uC5B4 \uC124\uC815\uC744 \uC800\uC7A5\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      continueOnboarding: "\uC628\uBCF4\uB529 \uACC4\uC18D",
      backToSettings: "\uC124\uC815\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
      subtitle: "\uC571 \uAE30\uBCF8 \uD45C\uC2DC \uC5B8\uC5B4\uB97C \uBCC0\uACBD\uD569\uB2C8\uB2E4.",
      placeholder: "\uC5B8\uC5B4 \uC120\uD0DD",
      saving: "\uC800\uC7A5 \uC911...",
    },
    region: {
      title: "\uC9C0\uC5ED \uC124\uC815",
      loadingSubtitle: "\uD604\uC7AC \uC9C0\uC5ED \uC124\uC815\uC744 \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      needProfileSubtitle: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uC788\uC5B4\uC57C \uC9C0\uC5ED \uC124\uC815\uC744 \uC800\uC7A5\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      continueOnboarding: "\uC628\uBCF4\uB529 \uACC4\uC18D",
      backToSettings: "\uC124\uC815\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
      subtitle: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC5D0 \uC800\uC7A5\uB418\uB294 \uC9C0\uC5ED \uCF54\uB4DC\uB97C \uC218\uC815\uD569\uB2C8\uB2E4. \uD604\uC7AC MVP\uC5D0\uC11C\uB294 \uBCA0\uD2B8\uB0A8 \uC9C0\uC5ED \uB370\uC774\uD130\uB9CC \uC81C\uACF5\uD569\uB2C8\uB2E4.",
      country: "\uAD6D\uAC00",
      countryValue: "Vietnam",
      helper: "Settings\uC758 \uC9C0\uC5ED \uBCC0\uACBD\uB3C4 \uC628\uBCF4\uB529\uACFC \uB3D9\uC77C\uD55C \uB0B4\uBD80 \uBCA0\uD2B8\uB0A8 \uC9C0\uC5ED \uB370\uC774\uD130 \uAE30\uC900\uC73C\uB85C \uB3D9\uC791\uD569\uB2C8\uB2E4.",
      province: "\uC2DC/\uC131",
      selectProvince: "\uC2DC/\uC131 \uC120\uD0DD",
      district: "\uAD6C/\uAD70",
      selectDistrict: "\uAD6C/\uAD70 \uC120\uD0DD",
      save: "\uC9C0\uC5ED \uC800\uC7A5",
      saving: "\uC800\uC7A5 \uC911...",
    },
    roles: {
      title: "\uACC4\uC815 \uC5ED\uD560",
      loadingSubtitle: "\uD604\uC7AC \uC5ED\uD560 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      needProfileSubtitle: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uC788\uC5B4\uC57C \uC5ED\uD560\uC744 \uCD94\uAC00\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      continueOnboarding: "\uC628\uBCF4\uB529 \uACC4\uC18D",
      backToSettings: "\uC124\uC815\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
      subtitle: "\uD604\uC7AC \uACC4\uC815\uC5D0 \uD544\uC694\uD55C \uC5ED\uD560\uC744 \uCD94\uAC00\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      currentRoles: "\uBCF4\uC720 \uC5ED\uD560",
      noRoles: "\uC544\uC9C1 \uC5ED\uD560\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      addSuffix: "\uCD94\uAC00",
      allAdded: "\uD604\uC7AC \uC9C0\uC6D0\uB418\uB294 \uC5ED\uD560\uC774 \uBAA8\uB450 \uCD94\uAC00\uB41C \uC0C1\uD0DC\uC785\uB2C8\uB2E4.",
    },
    visibility: {
      title: "\uACF5\uAC1C \uBC94\uC704",
      loadingSubtitle: "\uD604\uC7AC \uACF5\uAC1C \uBC94\uC704 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      needProfileSubtitle: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uC788\uC5B4\uC57C \uACF5\uAC1C \uBC94\uC704\uB97C \uC800\uC7A5\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      continueOnboarding: "\uC628\uBCF4\uB529 \uACC4\uC18D",
      backToSettings: "\uC124\uC815\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
      subtitle: "\uB0B4 \uD504\uB85C\uD544 \uACF5\uAC1C \uBC94\uC704\uB97C \uC124\uC815\uD569\uB2C8\uB2E4.",
      label: "\uACF5\uAC1C \uBC94\uC704",
      placeholder: "\uBC94\uC704 \uC120\uD0DD",
      save: "\uACF5\uAC1C \uBC94\uC704 \uC800\uC7A5",
      saving: "\uC800\uC7A5 \uC911...",
    },
    notifications: {
      title: "\uC54C\uB9BC",
      subtitle: "KickGo v3.1\uC5D0\uC11C \uC774 \uBA54\uB274\uB97C Settings\uC5D0 \uD3EC\uD568\uD558\uC9C0\uB9CC, \uC138\uBD80 \uC54C\uB9BC \uC124\uC815\uC740 \uD6C4\uC18D Phase \uC791\uC5C5\uC785\uB2C8\uB2E4.",
    },
    account: {
      title: "\uACC4\uC815",
      subtitle: "KickGo \uC0AC\uC6A9\uC5D0 \uD544\uC218\uC778 \uAC1C\uC778\uC815\uBCF4 \uB3D9\uC758\uC640 \uC120\uD0DD \uB9C8\uCF00\uD305 \uB3D9\uC758\uB97C \uAD00\uB9AC\uD569\uB2C8\uB2E4.",
      privacySection: "\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68",
      privacyStatusPrefix: "\uC0C1\uD0DC",
      required: "\uD544\uC218",
      agreed: "\uB3D9\uC758",
      policyVersionPrefix: "\uC815\uCC45 \uBC84\uC804",
      recordedAtPrefix: "\uAE30\uB85D \uC2DC\uAC01",
      agreePrivacy: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68 \uB3D9\uC758",
      marketingSection: "\uB9C8\uCF00\uD305 \uB3D9\uC758",
      marketingTitle: "\uB9C8\uCF00\uD305 \uC5C5\uB370\uC774\uD2B8 \uC218\uC2E0",
      marketingDescription: "KickGo\uAC00 \uD504\uB85C\uBAA8\uC158, \uC11C\uBE44\uC2A4 \uC5C5\uB370\uC774\uD2B8, \uC774\uBCA4\uD2B8 \uACF5\uC9C0\uB97C \uBCF4\uB0B4\uB3C4\uB85D \uD5C8\uC6A9\uD569\uB2C8\uB2E4.",
      currentStatePrefix: "\uD604\uC7AC \uC0C1\uD0DC",
      notAgreed: "\uBBF8\uB3D9\uC758",
      saveMarketing: "\uB9C8\uCF00\uD305 \uB3D9\uC758 \uC800\uC7A5",
      notRecorded: "\uAE30\uB85D \uC5C6\uC74C",
    },
  },
};

const VI: TranslationTree = {
  common: {
    language: "Ngôn ngữ",
    save: "Lưu",
    cancel: "Hủy",
    logout: "Đăng xuất",
    loading: "Đang tải...",
    home: "Trang chủ",
  },
  auth: {
    login: {
      title: "Đăng nhập",
      subtitle: "Đăng nhập bằng tài khoản hiện có và tiếp tục onboarding.",
      emailPlaceholder: "Địa chỉ email",
      passwordPlaceholder: "Mật khẩu",
      emailButton: "Đăng nhập bằng email",
      emailButtonLoading: "Đang đăng nhập...",
      signupButton: "Đăng ký",
      googleButton: "Tiếp tục với Google",
      googleHelper: "Đăng nhập Google vẫn được giữ lại, nhưng việc quay lại ứng dụng trong Expo Go bị hạn chế.",
      validationRequiredEmail: "Vui lòng nhập email.",
      validationInvalidEmail: "Vui lòng nhập đúng định dạng email.",
      validationPasswordLength: "Mật khẩu phải có ít nhất 6 ký tự.",
    },
    signup: {
      title: "Đăng ký",
      subtitle: "Tạo tài khoản KickGo và bắt đầu luồng onboarding Phase 2.",
      emailPlaceholder: "Địa chỉ email",
      passwordPlaceholder: "Mật khẩu",
      signupButton: "Đăng ký bằng email",
      signupButtonLoading: "Đang tạo tài khoản...",
      loginButton: "Đăng nhập",
      validationRequiredEmail: "Vui lòng nhập email.",
      validationInvalidEmail: "Vui lòng nhập đúng định dạng email.",
      validationPasswordLength: "Mật khẩu phải có ít nhất 6 ký tự.",
    },
    phoneVerify: {
      title: "Xác minh số điện thoại",
      subtitle: "Theo luồng tài liệu, bước xác minh số điện thoại được kiểm tra trước.",
      helperCreate: "Trong MVP hiện tại, chúng tôi kiểm tra việc chuyển sang bước onboarding tiếp theo trước khi triển khai SMS thực tế.",
      helperRole: "Hồ sơ chung đã tồn tại. Hãy tiếp tục phần onboarding vai trò còn lại.",
      helperDone: "Hồ sơ chung và onboarding vai trò đã hoàn tất. Bạn có thể vào trang chủ.",
      continueProfile: "Tiếp tục tới hồ sơ chung",
      continueRole: "Tiếp tục onboarding vai trò",
      goHome: "Đi tới trang chủ",
    },
  },
  profile: {
    editCancel: "Hủy chỉnh sửa",
  },
  home: {
    loadingDescription: "Đang kiểm tra trạng thái tài khoản và tiến độ onboarding.",
    guestDescription: "Quản lý bóng đá phong trào từ vận hành đội bóng đến ghi nhận trận đấu trong một nơi.",
    login: "Đăng nhập",
    signup: "Đăng ký",
    needProfileDescription: "Hồ sơ chung của bạn chưa hoàn tất. Hãy tiếp tục bước tiếp theo.",
    phoneVerify: "Xác minh số điện thoại",
    createProfile: "Thiết lập hồ sơ chung",
    pendingRoleDescription: "Onboarding theo vai trò vẫn còn. Hãy hoàn tất thông tin còn lại để vào trang chủ.",
    continueRoleOnboarding: "Tiếp tục onboarding vai trò",
    profile: "Hồ sơ",
    completedDescription: "Chào mừng. Hồ sơ chung và onboarding theo vai trò đã hoàn tất.",
    openProfile: "Mở hồ sơ",
    settings: "Cài đặt",
  },
  profileTab: {
    title: "Hồ sơ",
    loadingDescription: "Đang tải thông tin hồ sơ.",
    needProfileDescription: "Hoàn tất hồ sơ chung trước để quản lý cài đặt và thông tin hồ sơ.",
    createProfile: "Thiết lập hồ sơ chung",
    phoneVerify: "Xác minh số điện thoại",
    name: "Tên",
    email: "Email",
    language: "Ngôn ngữ",
    region: "Khu vực",
    roles: "Vai trò",
    editProfile: "Chỉnh sửa hồ sơ",
    continueRoleOnboarding: "Tiếp tục onboarding vai trò",
    settings: "Cài đặt",
    notSet: "Chưa thiết lập",
  },
  onboarding: {
    createProfile: {
      loadingTitle: "Hồ sơ chung",
      loadingSubtitle: "Đang tải trạng thái hồ sơ và đồng ý.",
      existingTitle: "Hồ sơ chung",
      existingSubtitle: "Hồ sơ chung đã tồn tại. Hãy kiểm tra các mục đồng ý cần thiết và chuyển sang bước tiếp theo.",
      continueRole: "Tiếp tục onboarding vai trò",
      goHome: "Đi tới trang chủ",
      createTitle: "Tạo hồ sơ chung",
      createSubtitle: "Hãy lưu thông tin người dùng chung trước khi chuyển sang onboarding theo vai trò.",
      editTitle: "Chỉnh sửa hồ sơ chung",
      editSubtitle: "Cập nhật thông tin hồ sơ chung được dùng trong Settings.",
      displayName: "Tên hiển thị",
      displayNamePlaceholder: "Tên hiển thị",
      birthYearOptional: "Năm sinh (tùy chọn)",
      birthYearPlaceholder: "Ví dụ: 1993",
      country: "Quốc gia",
      countryValue: "Vietnam",
      countryHelper: "MVP hiện tại chỉ hỗ trợ dữ liệu khu vực tại Việt Nam.",
      province: "Tỉnh/Thành phố",
      selectProvince: "Chọn tỉnh/thành phố",
      district: "Quận/Huyện",
      selectDistrict: "Chọn quận/huyện",
      language: "Ngôn ngữ",
      languageHelper: "Ngôn ngữ ban đầu theo ngôn ngữ hiện tại của ứng dụng và có thể đổi sau trong Settings.",
      initialRole: "Vai trò ban đầu",
      chooseRole: "Chọn vai trò",
      bioOptional: "Giới thiệu (tùy chọn)",
      bioPlaceholder: "Giới thiệu ngắn",
      requiredConsents: "Đồng ý bắt buộc",
      privacyTitle: "Đồng ý chính sách quyền riêng tư",
      privacyDescription: "Bắt buộc để sử dụng dịch vụ KickGo.",
      marketingTitle: "Đồng ý nhận thông tin marketing",
      marketingDescription: "Nhận thông tin khuyến mãi, sự kiện và cập nhật.",
      saveCreate: "Lưu hồ sơ chung",
      saveEdit: "Lưu thay đổi",
      saveLoading: "Đang lưu...",
      continueExisting: "Tiếp tục",
      validationDisplayName: "Vui lòng nhập tên hiển thị.",
      validationBirthYear: "Năm sinh phải là số.",
      validationRegion: "Vui lòng chọn cả tỉnh/thành và quận/huyện.",
      validationRole: "Vui lòng chọn vai trò ban đầu.",
      validationPrivacy: "Cần đồng ý chính sách quyền riêng tư.",
    },
    roleOnboarding: {
      title: "Onboarding theo vai trò",
      subtitle: "Hãy nhập thông tin bổ sung cần thiết cho vai trò đã chọn.",
      needCommonProfile: "Cần hoàn tất hồ sơ chung trước.",
      needCommonProfileHelper: "Sau khi lưu thông tin người dùng chung, hãy tiếp tục onboarding cầu thủ hoặc trọng tài.",
      moveToCommonProfile: "Đi tới hồ sơ chung",
      playerSection: "Hồ sơ cầu thủ",
      preferredPosition: "Vị trí ưa thích",
      selectPosition: "Chọn vị trí",
      preferredFoot: "Chân thuận",
      selectPreferredFoot: "Chọn chân thuận",
      dominantFoot: "Chân sử dụng chính",
      selectDominantFoot: "Chọn chân sử dụng chính",
      topSizeOptional: "Cỡ áo (tùy chọn)",
      selectTopSize: "Chọn cỡ",
      shoeSizeOptional: "Cỡ giày (tùy chọn)",
      selectShoeSize: "Chọn cỡ",
      none: "Không chọn",
      savePlayer: "Lưu hồ sơ cầu thủ",
      saveLoading: "Đang lưu...",
      playerValidation: "Vui lòng chọn đầy đủ các mục bắt buộc của hồ sơ cầu thủ.",
      refereeSection: "Hồ sơ trọng tài",
      refereeHelper: "Ở giai đoạn MVP, chỉ tạo hồ sơ trọng tài tối thiểu.",
      createReferee: "Tạo hồ sơ trọng tài",
      facilityManagerSection: "Quản lý sân",
      facilityManagerHelper: "Liên kết cơ sở và cài đặt vận hành chi tiết sẽ được hỗ trợ ở giai đoạn sau.",
      completedSection: "Hoàn tất onboarding",
      completedHelper: "Tất cả thông tin theo vai trò còn lại đã hoàn tất.",
      goHome: "Đi tới trang chủ",
    },
  },
  settings: {
    main: {
      title: "Cài đặt",
      loadingSubtitle: "Đang tải thông tin cài đặt.",
      needProfileSubtitle: "Cần hoàn tất hồ sơ chung trước khi sử dụng các mục cài đặt.",
      needProfileHelper: "Hãy đi đến màn hình phù hợp với bước onboarding hiện tại.",
      continueOnboarding: "Tiếp tục onboarding",
      goHome: "Đi tới trang chủ",
      subtitle: "Đây là các mục cài đặt chung cho Phase 2 MVP theo tài liệu KickGo v3.1.",
      profileSection: "Hồ sơ",
      commonSection: "Cài đặt chung",
      appSection: "Ứng dụng",
      notSet: "Chưa thiết lập",
      visibilityPrefix: "Phạm vi công khai",
      editProfile: "Chỉnh sửa hồ sơ",
      profileVisibility: "Phạm vi công khai hồ sơ",
      language: "Ngôn ngữ",
      region: "Khu vực",
      roles: "Vai trò tài khoản",
      notifications: "Thông báo",
      account: "Tài khoản",
      versionPrefix: "Phiên bản",
    },
    language: {
      title: "Ngôn ngữ",
      loadingSubtitle: "Đang tải cài đặt ngôn ngữ hiện tại.",
      needProfileSubtitle: "Cần có hồ sơ chung để lưu cài đặt ngôn ngữ.",
      continueOnboarding: "Tiếp tục onboarding",
      backToSettings: "Quay lại cài đặt",
      subtitle: "Thay đổi ngôn ngữ mặc định của ứng dụng.",
      placeholder: "Chọn ngôn ngữ",
      saving: "Đang lưu...",
    },
    region: {
      title: "Cài đặt khu vực",
      loadingSubtitle: "Đang tải cài đặt khu vực hiện tại.",
      needProfileSubtitle: "Cần có hồ sơ chung để lưu cài đặt khu vực.",
      continueOnboarding: "Tiếp tục onboarding",
      backToSettings: "Quay lại cài đặt",
      subtitle: "Cập nhật mã khu vực được lưu trong hồ sơ chung. MVP hiện tại chỉ hỗ trợ dữ liệu Việt Nam.",
      country: "Quốc gia",
      countryValue: "Vietnam",
      helper: "Cài đặt khu vực trong Settings sử dụng cùng bộ dữ liệu nội bộ như onboarding.",
      province: "Tỉnh/Thành phố",
      selectProvince: "Chọn tỉnh/thành phố",
      district: "Quận/Huyện",
      selectDistrict: "Chọn quận/huyện",
      save: "Lưu khu vực",
      saving: "Đang lưu...",
    },
    roles: {
      title: "Vai trò tài khoản",
      loadingSubtitle: "Đang tải thông tin vai trò hiện tại.",
      needProfileSubtitle: "Cần có hồ sơ chung để thêm vai trò.",
      continueOnboarding: "Tiếp tục onboarding",
      backToSettings: "Quay lại cài đặt",
      subtitle: "Bạn có thể thêm các vai trò cần thiết cho tài khoản hiện tại.",
      currentRoles: "Vai trò hiện có",
      noRoles: "Chưa có vai trò nào.",
      addSuffix: "thêm",
      allAdded: "Tất cả vai trò hiện hỗ trợ đã được thêm.",
    },
    visibility: {
      title: "Phạm vi công khai",
      loadingSubtitle: "Đang tải thông tin phạm vi công khai hiện tại.",
      needProfileSubtitle: "Cần có hồ sơ chung để lưu phạm vi công khai.",
      continueOnboarding: "Tiếp tục onboarding",
      backToSettings: "Quay lại cài đặt",
      subtitle: "Thiết lập phạm vi công khai cho hồ sơ của bạn.",
      label: "Phạm vi công khai",
      placeholder: "Chọn phạm vi",
      save: "Lưu phạm vi công khai",
      saving: "Đang lưu...",
    },
    notifications: {
      title: "Thông báo",
      subtitle: "KickGo v3.1 có mục này trong Settings, nhưng các công tắc thông báo chi tiết thuộc phase sau.",
    },
    account: {
      title: "Tài khoản",
      subtitle: "Quản lý đồng ý quyền riêng tư bắt buộc và đồng ý marketing tùy chọn cho KickGo.",
      privacySection: "Chính sách quyền riêng tư",
      privacyStatusPrefix: "Trạng thái",
      required: "Bắt buộc",
      agreed: "Đã đồng ý",
      policyVersionPrefix: "Phiên bản chính sách",
      recordedAtPrefix: "Thời điểm ghi nhận",
      agreePrivacy: "Đồng ý chính sách quyền riêng tư",
      marketingSection: "Đồng ý marketing",
      marketingTitle: "Nhận cập nhật marketing",
      marketingDescription: "Cho phép KickGo gửi khuyến mãi, cập nhật dịch vụ và thông báo sự kiện.",
      currentStatePrefix: "Trạng thái hiện tại",
      notAgreed: "Chưa đồng ý",
      saveMarketing: "Lưu đồng ý marketing",
      notRecorded: "Chưa ghi nhận",
    },
  },
};
const EN: TranslationTree = {
  common: {
    language: "Language",
    save: "Save",
    cancel: "Cancel",
    logout: "Logout",
    loading: "Loading...",
    home: "Home",
  },
  auth: {
    login: {
      title: "Login",
      subtitle: "Sign in with your existing account and continue onboarding.",
      emailPlaceholder: "Email address",
      passwordPlaceholder: "Password",
      emailButton: "Sign in with email",
      emailButtonLoading: "Signing in...",
      signupButton: "Sign up",
      googleButton: "Continue with Google",
      googleHelper: "Google login is kept, but return-to-app verification is limited in Expo Go.",
      validationRequiredEmail: "Please enter your email.",
      validationInvalidEmail: "Please enter a valid email address.",
      validationPasswordLength: "Password must be at least 6 characters.",
    },
    signup: {
      title: "Sign Up",
      subtitle: "Create a KickGo account and start the Phase 2 onboarding flow.",
      emailPlaceholder: "Email address",
      passwordPlaceholder: "Password",
      signupButton: "Sign up with email",
      signupButtonLoading: "Creating account...",
      loginButton: "Login",
      validationRequiredEmail: "Please enter your email.",
      validationInvalidEmail: "Please enter a valid email address.",
      validationPasswordLength: "Password must be at least 6 characters.",
    },
    phoneVerify: {
      title: "Phone Verification",
      subtitle: "Following the documented flow, phone verification comes first.",
      helperCreate: "In this MVP, we confirm the transition to the next onboarding step before implementing real SMS verification.",
      helperRole: "A common profile already exists. Continue the remaining role onboarding steps.",
      helperDone: "Common profile and role onboarding are already completed. You can move to home.",
      continueProfile: "Continue to common profile",
      continueRole: "Continue to role onboarding",
      goHome: "Go to home",
    },
  },
  profile: {
    editCancel: "Cancel edit",
  },
  home: {
    loadingDescription: "Checking account status and onboarding progress.",
    guestDescription: "Manage grassroots football from team operations to match records in one place.",
    login: "Login",
    signup: "Sign up",
    needProfileDescription: "Your common profile is not completed yet. Continue to the next step.",
    phoneVerify: "Phone Verification",
    createProfile: "Set Up Common Profile",
    pendingRoleDescription: "Role-specific onboarding is still pending. Complete the remaining information to enter home.",
    continueRoleOnboarding: "Continue role onboarding",
    profile: "Profile",
    completedDescription: "Welcome. Your common profile and role onboarding are completed.",
    openProfile: "Open profile",
    settings: "Settings",
  },
  profileTab: {
    title: "Profile",
    loadingDescription: "Loading profile information.",
    needProfileDescription: "Complete the common profile first to manage settings and profile information.",
    createProfile: "Set up common profile",
    phoneVerify: "Phone Verification",
    name: "Name",
    email: "Email",
    language: "Language",
    region: "Region",
    roles: "Roles",
    editProfile: "Edit common profile",
    continueRoleOnboarding: "Continue role onboarding",
    settings: "Settings",
    notSet: "Not set",
  },
  onboarding: {
    createProfile: {
      loadingTitle: "Common Profile",
      loadingSubtitle: "Loading profile and consent status.",
      existingTitle: "Common Profile",
      existingSubtitle: "A common profile already exists. Confirm the required consent items and continue.",
      continueRole: "Continue role onboarding",
      goHome: "Go to home",
      createTitle: "Create Common Profile",
      createSubtitle: "Complete the shared user profile before moving to role onboarding.",
      editTitle: "Edit Common Profile",
      editSubtitle: "Update the common profile fields used in Settings.",
      displayName: "Display name",
      displayNamePlaceholder: "Display name",
      birthYearOptional: "Birth year (optional)",
      birthYearPlaceholder: "ex. 1993",
      country: "Country",
      countryValue: "Vietnam",
      countryHelper: "The current MVP supports Vietnam regional data only.",
      province: "Province",
      selectProvince: "Select province",
      district: "District",
      selectDistrict: "Select district",
      language: "Language",
      languageHelper: "The current app language is used initially. You can change it later in Settings.",
      initialRole: "Initial account role",
      chooseRole: "Choose role",
      bioOptional: "Bio (optional)",
      bioPlaceholder: "Short bio",
      requiredConsents: "Required consents",
      privacyTitle: "Privacy policy consent",
      privacyDescription: "Required consent for KickGo usage.",
      marketingTitle: "Marketing consent",
      marketingDescription: "Receive promotions, event updates, and product announcements.",
      saveCreate: "Save common profile",
      saveEdit: "Save changes",
      saveLoading: "Saving...",
      continueExisting: "Continue",
      validationDisplayName: "Display name is required.",
      validationBirthYear: "Birth year must be numeric.",
      validationRegion: "Please choose both province and district.",
      validationRole: "Please choose an initial account role.",
      validationPrivacy: "Privacy policy consent is required.",
    },
    roleOnboarding: {
      title: "Role Onboarding",
      subtitle: "Provide the additional information required for the selected roles.",
      needCommonProfile: "You need to complete the common profile first.",
      needCommonProfileHelper: "Save the shared user information before continuing player or referee onboarding.",
      moveToCommonProfile: "Go to common profile",
      playerSection: "Player Profile",
      preferredPosition: "Preferred position",
      selectPosition: "Select position",
      preferredFoot: "Preferred foot",
      selectPreferredFoot: "Select preferred foot",
      dominantFoot: "Dominant foot",
      selectDominantFoot: "Select dominant foot",
      topSizeOptional: "Top size (optional)",
      selectTopSize: "Select size",
      shoeSizeOptional: "Shoe size (optional)",
      selectShoeSize: "Select size",
      none: "None",
      savePlayer: "Save player profile",
      saveLoading: "Saving...",
      playerValidation: "Please select every required player profile field.",
      refereeSection: "Referee Profile",
      refereeHelper: "In the MVP stage, only the minimal referee profile is created.",
      createReferee: "Create referee profile",
      facilityManagerSection: "Facility Manager",
      facilityManagerHelper: "Facility linkage and operations detail are supported in a later phase.",
      completedSection: "Onboarding Complete",
      completedHelper: "All remaining role-specific inputs are completed.",
      goHome: "Go to home",
    },
  },
  settings: {
    main: {
      title: "Settings",
      loadingSubtitle: "Loading settings information.",
      needProfileSubtitle: "Complete the common profile first to use the settings menu.",
      needProfileHelper: "Move to the screen that matches your current onboarding step.",
      continueOnboarding: "Continue onboarding",
      goHome: "Go to home",
      subtitle: "These are the common settings items for KickGo v3.1 Phase 2 MVP.",
      profileSection: "Profile",
      commonSection: "Common Settings",
      appSection: "App",
      notSet: "Not set",
      visibilityPrefix: "Visibility",
      editProfile: "Edit profile",
      profileVisibility: "Profile visibility",
      language: "Language",
      region: "Region",
      roles: "Account Roles",
      notifications: "Notifications",
      account: "Account",
      versionPrefix: "Version",
    },
    language: {
      title: "Language",
      loadingSubtitle: "Loading the current language setting.",
      needProfileSubtitle: "A common profile is required before saving language settings.",
      continueOnboarding: "Continue onboarding",
      backToSettings: "Back to settings",
      subtitle: "Change the default display language for the app.",
      placeholder: "Select language",
      saving: "Saving...",
    },
    region: {
      title: "Region Settings",
      loadingSubtitle: "Loading the current region settings.",
      needProfileSubtitle: "A common profile is required before saving region settings.",
      continueOnboarding: "Continue onboarding",
      backToSettings: "Back to settings",
      subtitle: "Update the region codes stored in the common profile. The current MVP supports Vietnam data only.",
      country: "Country",
      countryValue: "Vietnam",
      helper: "Region changes in Settings use the same internal Vietnam dataset as onboarding.",
      province: "Province",
      selectProvince: "Select province",
      district: "District",
      selectDistrict: "Select district",
      save: "Save region",
      saving: "Saving...",
    },
    roles: {
      title: "Account Roles",
      loadingSubtitle: "Loading current role information.",
      needProfileSubtitle: "A common profile is required before adding roles.",
      continueOnboarding: "Continue onboarding",
      backToSettings: "Back to settings",
      subtitle: "You can add the roles needed for the current account.",
      currentRoles: "Current roles",
      noRoles: "No roles yet.",
      addSuffix: "add",
      allAdded: "All currently supported roles have already been added.",
    },
    visibility: {
      title: "Visibility",
      loadingSubtitle: "Loading the current visibility setting.",
      needProfileSubtitle: "A common profile is required before saving visibility settings.",
      continueOnboarding: "Continue onboarding",
      backToSettings: "Back to settings",
      subtitle: "Set the visibility range for your profile.",
      label: "Visibility",
      placeholder: "Select visibility",
      save: "Save visibility",
      saving: "Saving...",
    },
    notifications: {
      title: "Notifications",
      subtitle: "KickGo v3.1 includes this menu in Settings, but detailed notification toggles remain a later-phase task.",
    },
    account: {
      title: "Account",
      subtitle: "Manage the required privacy consent and the optional marketing consent for KickGo.",
      privacySection: "Privacy Policy",
      privacyStatusPrefix: "Status",
      required: "Required",
      agreed: "Agreed",
      policyVersionPrefix: "Policy version",
      recordedAtPrefix: "Recorded at",
      agreePrivacy: "Agree to privacy policy",
      marketingSection: "Marketing Consent",
      marketingTitle: "Receive marketing updates",
      marketingDescription: "Allow KickGo to send promotions, service updates, and event notices.",
      currentStatePrefix: "Current state",
      notAgreed: "Not agreed",
      saveMarketing: "Save marketing consent",
      notRecorded: "Not recorded",
    },
  },
};

export const TRANSLATIONS: Record<SupportedLanguage, TranslationTree> = {
  ko: KO,
  vi: VI,
  en: EN,
};

export function translate(language: SupportedLanguage, key: string): string {
  const segments = key.split(".");
  let current: unknown = TRANSLATIONS[language];

  for (const segment of segments) {
    if (typeof current !== "object" || current === null) {
      return key;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === "string" ? current : key;
}