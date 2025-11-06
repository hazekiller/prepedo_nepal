// app/components/shared/Navbar.js - PREPEDO NEPAL
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { COLORS } from '../../config/colors';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const menuItems = [
    { label: 'HOME', route: '/' },
    { label: 'ABOUT', route: '/about' },
    { label: 'FLEET', route: '/fleet' },
    { label: 'SUPPORT', route: '/support' },
    { label: 'CONTACT', route: '/contact' },
  ];

  const handleNavigate = (route) => {
    router.push(route);
    setMenuOpen(false);
  };

  const isActiveRoute = (route) => {
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname.startsWith(route)) return true;
    return false;
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => handleNavigate('/')}
        >
          <Image
            source={require('../../../assets/prepedo-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>prepedo</Text>
          <Text style={styles.logoSubtext}>NEPAL</Text>
        </TouchableOpacity>

        {/* Desktop Menu */}
        {!isMobile && (
          <View style={styles.rightSection}>
            <View style={styles.menuContainer}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.menuItem}
                  onPress={() => handleNavigate(item.route)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      isActiveRoute(item.route) && styles.menuTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isActiveRoute(item.route) && (
                    <View style={styles.activeIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Auth Buttons */}
            <View style={styles.authContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => handleNavigate('/login')}
              >
                <Text style={styles.loginText}>LOGIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => handleNavigate('/register')}
              >
                <Text style={styles.registerText}>REGISTER</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Mobile Hamburger */}
        {isMobile && (
          <TouchableOpacity
            style={styles.hamburger}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            <View
              style={[
                styles.hamburgerLine,
                menuOpen && styles.hamburgerLineOpen1,
              ]}
            />
            <View
              style={[
                styles.hamburgerLine,
                menuOpen && styles.hamburgerLineOpen2,
              ]}
            />
            <View
              style={[
                styles.hamburgerLine,
                menuOpen && styles.hamburgerLineOpen3,
              ]}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile Dropdown */}
      {isMobile && menuOpen && (
        <View style={styles.mobileMenu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.mobileMenuItem}
              onPress={() => handleNavigate(item.route)}
            >
              <Text
                style={[
                  styles.mobileMenuText,
                  isActiveRoute(item.route) && styles.mobileMenuTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Mobile Auth Buttons */}
          <View style={styles.mobileAuthContainer}>
            <TouchableOpacity
              style={styles.mobileLoginButton}
              onPress={() => handleNavigate('/login')}
            >
              <Text style={styles.mobileLoginText}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileRegisterButton}
              onPress={() => handleNavigate('/register')}
            >
              <Text style={styles.mobileRegisterText}>REGISTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 4,
    marginTop: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  menuItem: {
    position: 'relative',
  },
  menuText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  menuTextActive: {
    color: COLORS.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  authContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  loginText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  registerButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  registerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
  hamburger: {
    padding: 10,
  },
  hamburgerLine: {
    width: 25,
    height: 3,
    backgroundColor: COLORS.text,
    marginVertical: 2,
    borderRadius: 2,
  },
  hamburgerLineOpen1: {
    transform: [{ rotate: '45deg' }, { translateY: 7 }],
  },
  hamburgerLineOpen2: {
    opacity: 0,
  },
  hamburgerLineOpen3: {
    transform: [{ rotate: '-45deg' }, { translateY: -7 }],
  },
  mobileMenu: {
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 15,
  },
  mobileMenuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  mobileMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  mobileMenuTextActive: {
    color: COLORS.primary,
  },
  mobileAuthContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mobileLoginButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  mobileLoginText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  mobileRegisterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  mobileRegisterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
});